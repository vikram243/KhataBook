const Joi = require('joi');

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
  
module.exports = hisaabJoiSchema;