import userController from "../controller/userController.js";
import express, { application } from 'express'
import userAuth from '../middleware/authentication.js'

const route = express.Router();

//authenticity middle ware
route.use("/changepassword", userAuth);
route.use("/loggeduser", userAuth);
//protected Routes

route.post("/loggeduser", userController.loggedUser);
route.post("/changepassword", userController.changePassword);
route.post("/sendresetpasswordemail", userController.sendResetPasswordEmail);
route.post("/resetpassword/:id/:token", userController.resetPassword);


//public Routes
route.post("/register", userController.userRegistration);
route.post("/login", userController.userLogin);
export default route;