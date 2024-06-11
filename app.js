import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/dbconnect.js';
import userRoute from './routes/userRoute.js'
dotenv.config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
connectDB(DATABASE_URL);


const app = express();
app.use(express.json());

app.use("/user", userRoute);

app.listen(PORT, ()=>{
    console.log(`http://localhost:${PORT}`)
})