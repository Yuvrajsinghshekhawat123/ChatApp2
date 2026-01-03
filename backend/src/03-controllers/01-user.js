import {
  ChangeUserPassword,
  createUser,
  DeleteAvatarUrl,
  findUserByEmail,
  findUserById,
  getAvatarPublicId,
  insertAvatarUrl,
  updateProfile,
  updateUserById,
  updateUserEmail,
  updateUserPassword,
} from "../02-models/01-user.js";
import argon2 from "argon2";

import crypto from "crypto";
import {
  deleteVerification,
  findVerificationByEmail,
  insertEmailVerification,
} from "../02-models/02-email-verification.js";
import { sendVerificationCode } from "../07-ResendApi/emailVerification/01-sendVerificationCode.js";
import {
  setAccessTokenCookies,
  setRefreshTokenCookie,
} from "../06-utils/token.js";
import {
  deleteUserSession,
  insertUserSessionRecord,
} from "../02-models/session.js";
import { uploadImageClodinary } from "../06-utils/cloudinary/uploadImageClodinary.js";
import cloudinary from "../06-utils/cloudinary/cloudinary.js";
import { deleteOtpWhenError, findResetPasswordUser, savePasswordVerificationToken } from "../02-models/forgot_password.js";
import { sendResetPasswordVerificationCode } from "../07-ResendApi/resetPassword/sendResetPasswordVerificationCode.js";
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser.length !== 0) {
      return res
        .status(409)
        .json({ success: false, message: "User already exits" });
    }

    // hash the password
    const hashedPassword = await argon2.hash(password);

    // genrate 6 digit otp
    const token = crypto.randomInt(100000, 999999).toString();
    const hashedToken = await argon2.hash(token);

    // save to emailverification table
    await insertEmailVerification(name, email, hashedPassword, hashedToken);

    // send verification on eamil
    // this will trigger the verification process

    const emailResult = await sendVerificationCode(name, email, token);
    if (!emailResult.success) {
      await deleteVerification(email); // delete the row
      return res
        .status(500)
        .json({ success: false, message: emailResult.message });
    }

    // 6. Respond
    res.status(201).json({ success: true, message: emailResult.message });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Registration failed" });
  }
}

// verify the emailVerify code
export async function verifiyEmail(req, res) {
  try {
    const { email, code } = req.body;

    const record = await findVerificationByEmail(email);
    if (!record || record.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Verification record not found" });
    }

    // check if code is expired
    const now = Date.now(); // number (milliseconds)
    const expiryTime = new Date(record[0].expiresAt).getTime();

    if (!record[0].expiresAt || expiryTime < now) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired" });
    }

    // compare the token
    const isMatch = await argon2.verify(record[0].token, code);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    // 4. Move user from verification table -> users table
    await createUser(record[0].name, record[0].email, record[0].passwordHash);

    await deleteVerification(email);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "verification code file" });
  }
}

// Resend the email verifaction code
export async function ResendCode(req, res) {
  try {
    const { name, email } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name or email is missing or invalid",
      });
    }

    const record = await findVerificationByEmail(email);
    if (!record || record.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Verification record not found" });
    }

    // genrate 6 digit otp
    const token = crypto.randomInt(100000, 999999).toString();
    const hashedToken = await argon2.hash(token);

    await insertEmailVerification(
      name,
      email,
      record[0].passwordHash,
      hashedToken
    );

    const emailResult = await sendVerificationCode(name, email, token);

    if (!emailResult.success) {
      await deleteVerification(email); // delete the row
      return res
        .status(500)
        .json({ success: false, message: emailResult.message });
    }

    // 6. Respond
    res.status(201).json({ success: true, message: emailResult.message });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Verification code fail" });
  }
}

// login the user
export async function loginUser(req, res) {
  try {

    console.log("hi");
    const { email, password } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser.length === 0) {
      return res
        .status(409)
        .json({ success: false, message: "User not found" });
    }

    const user = existingUser[0]; // get the first row
    // check if user is active or not
    if (user.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Contact to Admin" });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid password" });
    }

    // set access token and referse token
    const access_Token = setAccessTokenCookies(res, { userId: user.id });
    const refresh_Token = setRefreshTokenCookie(res, { userId: user.id });

    const hashedRefreshToken = await argon2.hash(refresh_Token);
    const userAgent = req.headers["user-agent"] || null;

    await insertUserSessionRecord(
      user.id,
      hashedRefreshToken,
      userAgent,
      req.clientIp
    );

    await updateUserById(user.id);

    res.status(200).json({ success: true, message: "User login successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Login user Details for profile
export async function LoginUserDetails(req, res) {
  try {
    const user = await findUserById(req.userId);
    if (user.length === 0)
      return res
        .status(409)
        .json({ success: false, message: "User not found" });
    // Pick only necessary fields
    const filteredUser = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      avatar: user[0].avatar,
      mobile: user[0].mobile,
      verify_email: user[0].verify_email,
      last_login_date: user[0].last_login_date,
      status: user[0].status,
      role: user[0].role,
      created_at: user[0].created_at,
    };

    return res
      .status(200)
      .json({ success: true, message: "User details", data: filteredUser }); // return single user object
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// logout
export async function logout(req, res) {
  try {
    const userAgent = req.headers["user-agent"] || null;
    await deleteUserSession(req.userId, userAgent, req.clientIp);

    res.clearCookie("access_Token");
    res.clearCookie("refresh_Token");
    res.status(201).json({ success: true, message: "User logut successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// upload the user avatar
export async function uploadAvatar(req, res) {
  try {
    const image = req.file;

    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    // before uploading the new one delete the previos one
    // 1. Get the old avatar_public_id before overeWriting
    const oldPublicId = await getAvatarPublicId(req.userId);

    const upload = await uploadImageClodinary(image);

    // store the url filed in db;
    await insertAvatarUrl(req.userId, upload.public_id, upload.url);

    if (oldPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(oldPublicId);

        if (result.result !== "ok" && result.result !== "not found") {
          return { success: false, message: "Cloudinary deletion failed" };
        }
      } catch (err) {
        return { success: false, message: "Failed to delete from Cloudinary" };
      }
    }

    return res.status(201).json({
      success: true,
      data: { userId: req.userId, avatar: upload.url },
      message: "file upload Successfully",
    });
  } catch (err) {}
}

// delete the avatar
export async function DeleteAvatar(req, res) {
  try {
    const user = await findUserById(req.userId);
    if (user.length === 0)
      return res
        .status(409)
        .json({ success: false, message: "User not found" });

    const result = await DeleteAvatarUrl(req.userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateUserDetails(req, res) {
  try {
    const { name, email, mobile  } = req.body;
    const user = await findUserById(req.userId);

     
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldUser = user[0];

    const updatedUser = {
      name: name || oldUser.name,
      mobile: mobile || oldUser.mobile,
    };

    // always update the non-email filed first
    await updateProfile(updatedUser.name, updatedUser.mobile, req.userId);




     if (email && email !== oldUser.email) {
      const token = crypto.randomInt(100000, 999999).toString();
      const hashedToken = await argon2.hash(token);
      await insertEmailVerification(
        updatedUser.name,
        email,
        oldUser.password,
        hashedToken
      );

      const emailResult = await sendVerificationCode(
        updatedUser.name,
        email,
        token
      );
      if (!emailResult.success) {
        await deleteVerification(email);
        console.log(emailResult)
        return res
          .status(500)
          .json({ success: false, message: emailResult.message });
      }

      // 6. Respond
      return res
        .status(200)
        .json({ success: true, message: emailResult.message });
    } else if (email === oldUser.email) {

     

       return res.status(400).json({
        success: false,
        message: "Email should not be same, change email should be differnt",
      });
    }



    

   return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (err) {


     
    if (err.code === "ER_DUP_ENTRY") {
      let errorMessage;
      if (err.sqlMessage.includes("users.email")) {
        errorMessage = "This email is already registered with another account.";
      } else {
        errorMessage = "Duplicate value found.";
      }

      return res.status(409).json({ success: false, message: errorMessage });
    }

  
    return res.status(500).json({ success: false, message: err.message });
  }
}

 

// verify email change
export async function verifyEmailChange(req, res) {
  try {
    const { email, code } = req.body; // ✅ use code, not token
    console.log(email);

    const record = await findVerificationByEmail(email);
    if (!record || record.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Verification record not found" });
    }

    // 1. Check if expired
     const now = Date.now(); // number (milliseconds)
    const expiryTime = new Date(record[0].expiresAt).getTime();

    if (!record[0].expiresAt || expiryTime < now) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired" });
    }

    // 2. Verify code
    const isMatch = await argon2.verify(record[0].token, code);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    

    // 4. Update only email
    await updateUserEmail(req.userId, email);

    // 5. Delete verification record
    await deleteVerification(email);

    res
      .status(201)
      .json({ success: true, message: "Email updated successfully" });
  } catch (err) {
    console.error("Verify Email Change Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
}



export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // 1. check if exits  in users table
    const existingUser = await findUserByEmail(email);
    if (existingUser.length === 0)
      return res
        .status(409)
        .json({ success: false, message: "User not found" });

    const user = existingUser[0];

    // 2. user exits now , send 6 digit otp
    const token = crypto.randomInt(100000, 999999).toString();
    const hashedToken = await argon2.hash(token);

    // 3. save otp in forgot_password table
    await savePasswordVerificationToken(user.id, hashedToken);

    const emailResult = await sendResetPasswordVerificationCode(
      user.name,
      email,
      token
    );


    if (!emailResult.success) {
      await deleteOtpWhenError(user.id);
      return res
        .status(500)
        .json({ success: false, message: emailResult.message });
    }

    // 6. Respond
    return res
      .status(200)
      .json({ success: true, message: emailResult.message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}






export async function verify_Reset_Password_OTP(req, res) {
  try {
    const { email, code } = req.body;
    console.log(email);
    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const ResetPasswordUserDetail = await findResetPasswordUser(
      existingUser[0].id
    );

    if (ResetPasswordUserDetail.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No reset request found" });
    }

    // check if token is expired or not
    const now = Date.now();
    const { otp, expires_at } = ResetPasswordUserDetail[0];
    if (!expires_at || new Date(expires_at).getTime() < now) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired" });
    }

    const isMatch = await argon2.verify(otp, code);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    //clen resours
    await deleteOtpWhenError(existingUser[0].id);
    // success → allow reset
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
}








// resend ResetPassword code
export async function ResendResetPasswordCode(req, res) {
  try {
    const { email } = req.body;

    console.log(email);
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "email is missing or invalid" });
    }

    // 1. find verification record
    const record = await findUserByEmail(email);
    if (!record || record.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Email is missing or invalid" });
    }

    const user = record[0];

    //3.  generate a 6 digit token
    const token = crypto.randomInt(100000, 999999).toString();
    const hashedToken = await argon2.hash(token);

    // 3. save otp in forgot_password table
    await savePasswordVerificationToken(user.id, hashedToken);

    // send verification on eamil
    // this will trigger the verification process
    const emailResult = await sendResetPasswordVerificationCode(
      user.name,
      email,
      token
    );
    if (!emailResult.success) {
      await deleteOtpWhenError(user.id);
      return res
        .status(500)
        .json({ success: false, message: emailResult.message });
    }

    // 6. Respond
    return res
      .status(200)
      .json({ success: true, message: emailResult.message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

 







export async function resetPassword(req, res) {
  try {
    const { email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    console.log(existingUser);
    if (existingUser.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const hashednewPassword = await argon2.hash(password);

    //update the password for enter email
    await updateUserPassword(email, hashednewPassword);

    console.log(existingUser);
    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}