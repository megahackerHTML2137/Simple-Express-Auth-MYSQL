import * as Joi from 'joi';

const USER_REGEX: RegExp = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const registerFormScheme: Joi.Schema = Joi.object({ 
        username: Joi.string().alphanum().regex(USER_REGEX).required(),
        email: Joi.string().regex(EMAIL_REGEX).required(),
        password: Joi.string().regex(PWD_REGEX).required(),
        //CHANGE ERROR MESSAGE
        passwordConfirm: Joi.string().regex(PWD_REGEX).valid(Joi.ref('password')).required(),
}).required();

export const loginFormScheme: Joi.Schema = Joi.object({ 
        username: Joi.string().alphanum().required(),
        password: Joi.string().required(),
}).required();