import express, { Express, Request, Response } from 'express';
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { auth } from 'express-openid-connect';

import indexRouter from "./src/routes/index.route"
import userRouter from './src/routes/user.route';

dotenv.config();

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.IS_USER_BASE_URL
};

const PORT = process.env.PORT;
const app: Express = express();


app.use(morgan("dev"))
app.use(cors());
app.use(express.json());
app.use(express.static("public"))
app.use("/identicons", express.static("identicons"))
app.use(auth(authConfig))


app.use("/", indexRouter)
app.use(`${process.env.API_ROUTE}${process.env.API_VERSION}/user`,userRouter)

app.listen(PORT, () => {
  console.log(`\x1b[35m[server]\x1b[0m Server is running at \x1b[36m http://localhost:${PORT} \x1b[30m`);
})






