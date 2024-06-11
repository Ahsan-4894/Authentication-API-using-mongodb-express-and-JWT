import mongoose from "mongoose";

const connectDB = async(DATABASE_URL)=>{
    try{
        await mongoose.connect(DATABASE_URL)
        console.log("connected to DB successfully");
    }catch(error){
        console.log(error)
    }
}
export default connectDB;