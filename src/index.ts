import "reflect-metadata";
import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createConnection } from "typeorm";
import user from "./routes/User";
import auth from "./routes/Auth";

console.log(__dirname);

const app: express.Express = express();
const port: string = process.env.PORT || "8000";

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.use("/user", user);
app.use("/auth", auth);

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

createConnection();

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
