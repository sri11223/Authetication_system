const ApiError = require('../utils/ApiError');

/**
 * Middleware factory that validates request body against a Joi schema.
 */
const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    throw ApiError.badRequest('Validation failed', errors);
  }

  req.body = value;
  next();
};

module.exports = validate;
