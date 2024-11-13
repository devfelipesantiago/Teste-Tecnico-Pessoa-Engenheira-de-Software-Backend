const Joi = require('joi');

const urlSchema = Joi.object({
  url: Joi.string().uri().required()
});

const updateUrlSchema = Joi.object({
  newUrl: Joi.string().uri().required()
});

module.exports = {
  urlSchema,
  updateUrlSchema
};