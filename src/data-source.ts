import { DataSource } from "typeorm"
import dotenv from "dotenv";

dotenv.config();

const port = process.env.DB_PORT as number | undefined;

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: port,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    entities: ["src/entities/*.entity.{ts,js}"],
    synchronize: true,
    // logging: true,
})

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

export default AppDataSource;