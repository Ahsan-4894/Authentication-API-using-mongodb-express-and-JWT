import dotenv from 'dotenv'
dotenv.config()
import userModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Transporter from "../config/emailConfig.js";

class userController{
    static userRegistration = async (req, res)=>{
        const {name, email, password, password_confirmation, tc} = req.body;

        const isExist = await userModel.findOne({email:email});
        try{
            if(isExist){
                res.send({"status":"Message Failed", "message":"Email already exist!"});
            }else{
                if(name && email &&  password && password_confirmation && tc){
                    if(password === password_confirmation){
                        const salt = await bcrypt.genSalt(12);
                        const hashPassword = await bcrypt.hash(password, salt);
                        const newUser = new userModel({
                            name:name,
                            email:email,
                            password:hashPassword,
                            tc:tc
                        });
                        await newUser.save();
                        const savedUser = await userModel.findOne({email:email});
                        const token = jwt.sign({userID:savedUser._id}, process.env.jwt_secret_key, {expiresIn:"5d"});
                        res.send({"status":"Success", "message":"Completed sign in!", "token":token});
                    }else{
                        res.send({"status":"Message Failed", "message":"Password doesn't match!"});
                    }
                }else{
                    res.send({"status":"Message Failed", "message":"All fields are required!"});
                }
            }
        }catch (error){
             res.send({"status":"Message Failed", "message":"Unable to register"});
        }
    }
    static userLogin = async (req, res)=>{
        const {email, password} = req.body;
        if(email && password){
            const isUserExist = await userModel.findOne({email:email});
            if(isUserExist){
                const isVerified = await bcrypt.compare(password, isUserExist.password);
                if(isVerified && email===isUserExist.email){
                    const token = jwt.sign({userID:isUserExist._id}, process.env.jwt_secret_key, {expiresIn:"5d"});
                    res.send({"status":"Success","Message":isUserExist, "token":token});
                }else{
                    res.send({"status":"Message Failed", "message":"Wrong Password!"});
                }
            }else{
                res.send({"status":"Message Failed", "message":"No such users Exist!"});
            }
        }else{
            res.send({"status":"Message Failed", "message":"All fields are required!"});
        }
    }
    static changePassword = async(req, res)=>{
        const {password, password_confirmation} = req.body;
        if(password && password_confirmation){
            if(password === password_confirmation){ 
                try {
                    const salt = await bcrypt.genSalt(10);
                    const newHashPassword = await bcrypt.hash(password, salt);
                    await userModel.findByIdAndUpdate(req.user._id, {$set:{password:newHashPassword}});
                }catch(error){
                    res.send({"status":"Message Failed", "message":"Error occurred!"});  
                }
                res.send({"status":"Successful", "message":"Password has been changed!"});                    
            }else{
                res.send({"status":"Message Failed", "message":"Password and password confirmation dont match!"});                    
            }
        }else{
            res.send({"status":"Message Failed", "message":"All fields are required!"});
        }
    }
    static loggedUser = async(req, res)=>{  
        try{
            res.send({"status":"Message Success", "Information":req.user});

        }catch(error){
            res.send({"status":"Message Failed", "message":"Error occurred!"});    
        }
    }


    static sendResetPasswordEmail = async(req, res)=>{
        const {email} = req.body;
        if(email){
            const user = await userModel.findOne({email:email});
            if(user){
                const secret = user._id + process.env.jwt_secret_key;
                const token = jwt.sign({userID:user._id}, secret, {expiresIn:"15m"});
                //frontend link
                const link = `http://127.0.0.1:3000/user/resetpassword/${user._id}/${token}`;
                let info = await Transporter.sendMail ({
                    from:process.env.EMAIL_USER,
                    to:user.email,
                    subject:"PassWord Reset Link!",
                    html:`<a href=${link}>Click here</a> to reset Password!`
                });
                
                res.send({"status":"Success", "message":"Email sent.Please check!"}); 
            }else{
                res.send({"status":"Message Failed", "message":"No such email registered yet!"}); 
            }
        }else{
            res.send({"status":"Message Failed", "message":"All fields are required!"}); 
        }
    }

    static resetPassword = async(req, res)=>{
        const {password, password_confirmation} = req.body;
        const {id,token} = req.params;
        const user = await userModel.findById(id);
        const new_secret = user._id + process.env.jwt_secret_key;
        try{
            jwt.verify(token, new_secret);
            if(password && password_confirmation){
                if(password===password_confirmation){
                    const salt = await bcrypt.genSalt(10);
                    const newHashPassword = await bcrypt.hash(password, salt);
                    await userModel.findByIdAndUpdate(user._id, {$set:{password:newHashPassword}});
                    res.send({"status":"Success", "message":"Password has been changed!"}); 
                }else{
                    res.send({"status":"Message Failed", "message":"Password and Password Confirmation Dont match!"}); 
                }
            }else{
                res.send({"status":"Message Failed", "message":"All fields are required!"}); 
            }
        }catch(error){
            res.send({"status":"Message Failed", "message":"An error occurred!"}); 
        }

    }
};
export default userController;