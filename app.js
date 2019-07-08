'use strict';

const express = require('express'),
      app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express'),
      swaggerDocument = require('./swagger.json');

const { DomainError, AccessDenied, InternalError } = require('./util/errors');
const config = require('./config');
const routes = require('./routes/person');

app.use(morgan('common'));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next) => {
  if (req.headers.authorization === config.apiKey) {
    return next();
  }
  next(new AccessDenied());
});
app.use('/api/v1', routes);

app.use((err, request, response, next) => {
  if (err instanceof DomainError) {
    return response.status(err.code).json(err);
  }
  const e = new InternalError();
  response.status(e.code).send(e);
});

app.listen(config.port, config.host);

module.exports = app;