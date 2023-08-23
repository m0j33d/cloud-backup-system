import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { User } from "../entities/users.entity";
import dataSource from '../data-source'

export const registerValidation = () => {
    return [
        body('fullName')
            .notEmpty()
            .isString()
            .withMessage('Full name must be a String'),
        body('email') 
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
              return dataSource.getRepository(User).findOneBy({ email: value }).then(userDoc => {
                if (userDoc) {
                  return Promise.reject(
                    'User exists already!'
                  );
                }
              });
            })            
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .isAlphanumeric()
            .trim(),
    ]
}

export const loginValidation = () => {
    return [
        body('email') 
            .isEmail()
            .withMessage('Please enter a valid email.')        
            .normalizeEmail(),
        body('password')
            .isLength({ min: 7 })
            .isAlphanumeric()
            .trim(),
    ]
}


export const validate = (req: Request, res: Response, next: NextFunction)  => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    return res.status(400).json({ errors: errors.array() });
}