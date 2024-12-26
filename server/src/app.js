import express from 'express';
const app = express();
import cors from 'cors';

//middlewares
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credential: true 
    })
)
//common middleware
app.use(express.urlencoded({limit: "16kb", extended: true}));
app.use(express.json({limit: "16kb"}));
app.use(express.static("public"));


// routes
import userRoute from './routes/user.route.js';
app.use("/api/v1/user", userRoute);

export {app}