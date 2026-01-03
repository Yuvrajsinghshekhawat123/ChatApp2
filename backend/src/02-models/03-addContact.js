import { getDB } from "../01-config/connectDb.js";



export async function findRequestBySenderIdAndReceiverId(userId1, userId2) {
  const db = getDB();

   const [rows] = await db.execute(
    `SELECT id
     FROM friend_requests
     WHERE
       (
         (sender_id = ? AND receiver_id = ?)
         OR
         (sender_id = ? AND receiver_id = ?)
       )
       AND status = 'pending'
     LIMIT 1`,
    [userId1, userId2, userId2, userId1]
  );

  return rows[0] || null;
}



// createRequest

export async function createRequest(senderId, receiverId) {
  const db = getDB();

  const [result] = await db.execute(
    `INSERT INTO friend_requests (sender_id, receiver_id, status)
     VALUES (?, ?, 'pending')`,
    [senderId, receiverId]
  );

  return result.insertId; // 🔥 REQUIRED
}



