import userModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken'

const userAuth = async(req, res, next)=>{
    const {authorization} = req.headers;
    if(authorization &&  authorization.startsWith('Bearer')){
        try {
            const token = authorization.split(' ')[1];
            const {userID} = jwt.verify(token, process.env.jwt_secret_key);
            req.user = await userModel.findById(userID).select('-password');
            next();
        }catch(error){
            res.send({"status":"Message Failed", "message":"Error occurred!"});    
        }
    }else{
        res.send({"status":"Message Failed", "message":"No token!"});    
    }
}
export default userAuth;