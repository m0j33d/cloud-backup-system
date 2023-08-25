import { User } from "../entities/users.entity";
import { Session } from "../entities/session.entity";
import dataSource from '../data-source'
import dotenv from "dotenv";

dotenv.config();
const sessionRepository = dataSource.getRepository(Session);

export const updateOrCreateUserSession = async (user: User, status: any) => {

    let session = await sessionRepository.findOneBy(user);

    if (!session)
        session = await sessionRepository.create({ user })

    session.status = status
    await sessionRepository.save(session);

    return session;

};
