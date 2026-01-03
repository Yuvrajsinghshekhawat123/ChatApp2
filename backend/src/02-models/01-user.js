import { getDB } from "../01-config/connectDb.js";
import cloudinary from "../06-utils/cloudinary/cloudinary.js";

export async function findUserByEmail(email) {
  const db = getDB();
  const [row] = await db.execute(`select * from users where email=?`, [email]);
  return row;
}

// insert user detils
export async function createUser(
  name,
  email,
  hashedPassword,
  is_verified = true
) {
  const db = getDB();
  await db.execute(
    `
        insert into users (name,email,password,verify_email) values(?,?,?,?)
    `,
    [name, email, hashedPassword, is_verified]
  );
}

// update the user login time

export async function updateUserById(userId) {
  const db = getDB();
  const last_login_date = new Date();
  await db.execute(`update users SET last_login_date=? where id=? `, [
    last_login_date,
    userId,
  ]);
}

export async function findUserById(id) {
  const db = getDB();
  const [row] = await db.execute(`select * from users where id=?`, [id]);
  return row;
}

export async function getAvatarPublicId(userId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT avatar_public_id FROM users WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    return null; // user not found
  }

  return rows[0].avatar_public_id; // may be null if no avatar
}

// update the avatar
export async function insertAvatarUrl(userId, avatar_publicId, url) {
  const db = getDB();
  await db.execute(
    `UPDATE users SET avatar_public_id=?,avatar = ? WHERE id = ?`,
    [avatar_publicId, url, userId]
  );
}

export async function DeleteAvatarUrl(userId) {
  const db = getDB();

  const [rows] = await db.execute(
    `SELECT avatar_public_id FROM users WHERE id = ?`,
    [userId]
  );

  const publicId = rows[0].avatar_public_id;
  if (!publicId) {
    return { success: false, message: "No avatar to delete" };
  }

  if (publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== "ok" && result.result !== "not found") {
        return { success: false, message: "Cloudinary deletion failed" };
      }


    } catch (err) {
      return { success: false, message: "Failed to delete from Cloudinary" };
    }
  }

  await db.execute(
    `UPDATE users SET avatar_public_id=null,avatar = null WHERE id = ?`,
    [userId]
  );

  return { success: true, message: "Avatar deleted successfully" };
}




export async function  ChangeUserPassword(hashednewPassword,userId) {
     const db=getDB();
     await db.execute(`
        update users set password=? where id=?
    `,[hashednewPassword,userId])
}



export async function  updateProfile(name,mobile,userId) {
    const db = getDB();
    await db.execute(`
        update users set name=?, mobile=? WHERE id=?
    `,[name,mobile,userId]);
}



export async function  updateUserEmail(userId,email) {
    const db = getDB();
    await db.execute(`
        update users set email=? WHERE id=?
    `,[email,userId]);
}



export async function updateUserPassword(email, hashednewPassword) {
  const db = getDB();
    await db.execute(`
        update users set password=? WHERE email=?
    `,[hashednewPassword,email]);
}






// get user by email and userid
export async function findUserByEmailExcludingSelf(email, userId) {
  const db = getDB();


  // id != ? → exclude logged-in user
  const [rows] = await db.execute(
    `SELECT id, name, email, avatar
     FROM users
     WHERE email = ? AND id != ?`,
    [email, userId]
  );

  return rows;
}
