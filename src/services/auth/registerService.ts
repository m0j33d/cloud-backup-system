import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from "../../entities/users.entity";
import dataSource from '../../data-source'

const registerService = async (req: Request, res: Response) => {
    req.body.password = await bcrypt.hash( req.body.password, 10);

    try {
        const user = await dataSource.getRepository(User).create(req.body)
        const results = await dataSource.getRepository(User).save(user)
        console.log(results);
        res.status(201).json({ message: 'User registered successfully'});
    
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error while registering user' });
    }
  };
  
export default registerService;