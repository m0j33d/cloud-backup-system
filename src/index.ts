import express, { Application } from "express";
import fileupload from "express-fileupload";
import cors from 'cors'

import Router from "./routes";
import { rateLimiter } from "./middleware/rate-limiter"
import { RootExceptionHandler } from "./exceptions/RootExceptionHandler"



const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(fileupload({ useTempFiles: true }));

app.use(rateLimiter);

app.use(Router);

app.use(RootExceptionHandler);

/** Get port from environment and store in Express. */
const port = process.env.PORT || "3000";


app.listen(port, () => {
  console.log(`Backup System Is Running on ${port}`);
});

export default app;
