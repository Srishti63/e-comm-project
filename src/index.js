import connectdb from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path: './.env'
})


connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`SERVER is RUNNING at PORT : ${process.env.PORT}`);
    })
}).catch((error)=>{
    console.log(`MONGOdb connnection failed !!!`, error);
})