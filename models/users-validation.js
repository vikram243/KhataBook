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


const hisaabJoiSchema = Joi.object({
    title: Joi.string()
     .trim()
     .alphanum()
     .min(3)
     .max(100)
     .required(),
  
    description: Joi.string()
     .trim()
     .required(),
  
    encrypted: Joi.boolean()
     .default(false),
  
    shareable: Joi.boolean()
     .default(false),
  
    passcode: Joi.string()
     .default(''),
  
    editpermissions: Joi.boolean()
     .default(false),
  });
  
module.exports = {userJoiSchema,hisaabJoiSchema};
