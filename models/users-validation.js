const Joi = require('joi');

const userJoiSchema = Joi.object({
  username: Joi.string()
   .trim()
   .min(3)
   .max(30)
   .required(),

  profilepicture: Joi.string()
   .trim()
   .allow(''),

  email: Joi.string()
   .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }) // Basic email validation
   .trim()
   .required(),

  password: Joi.string()
   .required(),
});

module.exports = userJoiSchema;
