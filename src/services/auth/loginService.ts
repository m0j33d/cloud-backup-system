import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from "../../entities/users.entity";
import dataSource from '../../data-source'
import * as jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const loginService = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const secret = process.env.JWT_SECRET as string | undefined;

    try {
        const user = await dataSource.getRepository(User).findOneBy({ email: email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
          }
    
          const token = jwt.sign({ userId: user.id }, `${secret}` , { expiresIn: '8h' });
          res.status(200).json({ token });
    
    } catch (error) {
        res.status(500).json({ message: 'Error while logging in' });
    }
  };
  
  export default loginService;