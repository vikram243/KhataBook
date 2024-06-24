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
   .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')) // Simple regex for password strength
   .required(),
});

module.exports = userJoiSchema;
