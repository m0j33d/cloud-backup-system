import express, { Application } from "express";
import Router from "./routes";



const app: Application = express();

app.use(express.json());
app.use(Router);

/** Get port from environment and store in Express. */
const port = process.env.PORT || "3000";


app.listen(port, () => {
  console.log(`Backup System Is Running on ${port}`);
});

export default app;
