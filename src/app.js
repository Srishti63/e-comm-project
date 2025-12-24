import express from "express";
import cors from "cors";
import cookieparser from "cookies-parser";

const app = express();

app.use(cors({
    origin: process.env.COR_ORIGIN,
    credentials : true
}))
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieparser())



export { app }