import { Router } from "express";
import { DeleteAvatar, forgotPassword, loginUser, LoginUserDetails, logout, registerUser, ResendCode, ResendResetPasswordCode, resetPassword, updateUserDetails, uploadAvatar, verifiyEmail, verify_Reset_Password_OTP, verifyEmailChange } from "../03-controllers/01-user.js";
import { jwtAuthMiddeware } from "../05-middlewares/jwtAuthMiddelware.js";
import { upload } from "../05-middlewares/multer.js";
export const userRouter=Router();



userRouter.post("/register",registerUser);
userRouter.post("/verify-email",verifiyEmail);
userRouter.post("/resend-Code",ResendCode);



// login the user
userRouter.post("/login",loginUser);
userRouter.get("/userDetails",jwtAuthMiddeware,LoginUserDetails);

userRouter.put('/upload-avatar',jwtAuthMiddeware,upload.single("avatar"),uploadAvatar)
userRouter.delete("/delete-avatar",jwtAuthMiddeware,DeleteAvatar)
userRouter.put('/update-profile',jwtAuthMiddeware, updateUserDetails)
userRouter.post("/verifyEmailChange",jwtAuthMiddeware,verifyEmailChange)


 userRouter.post('/forgot-password',forgotPassword);

userRouter.post('/verify-otp',verify_Reset_Password_OTP);
userRouter.post("/resend-reset-password-otp",ResendResetPasswordCode)
userRouter.post("/resetPassword",resetPassword);


userRouter.post("/logout",jwtAuthMiddeware,logout)