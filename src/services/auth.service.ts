import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { User } from "../entities/users.entity";
import { SessionStatus } from "../entities/session.entity"
import dataSource from '../data-source'
import { updateOrCreateUserSession } from '../services/session.service'


dotenv.config();
const userRepository = dataSource.getRepository(User)

export const loginService = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const secret = process.env.JWT_SECRET as string | undefined;

    try {
        const user = await userRepository.findOneBy({ email: email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        await updateOrCreateUserSession(user, SessionStatus.ACTIVE)

        const token = jwt.sign({ userId: user.id }, `${secret}`, { expiresIn: '8h' });
        res.status(200).json({ token });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error while logging in' });
    }
};

export const registerService = async (req: Request, res: Response) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);

    try {
        const user = await userRepository.create(req.body)
        await userRepository.save(user)
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Error while registering user' });
    }
};

export const revokeUserSessionService = async (req: Request, res: Response) => {
    const { userId } = req.body;

    try{
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
    
        await updateOrCreateUserSession(user, SessionStatus.REVOKED)

        res.status(200).json({ message: 'User session revoked successfully' });

    }catch(error){
        res.status(500).json({ error: 'Error while revoking user session' });
    }
   
}
