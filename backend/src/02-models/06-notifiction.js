import { getDB } from "../01-config/connectDb.js";
import { findUserById } from "./01-user.js";

export async function insertNotification(user_id, type, reference_id) {
  const db = getDB();

  const [result] = await db.execute(
    `INSERT INTO notifications (user_id, type, reference_id)
     VALUES (?, ?, ?)`,
    [user_id, type, reference_id]
  );

  return result.insertId; // 🔥 important
}


 export async function getNotificationById(notificationId) {
  const db = getDB();

  const [[notification]] = await db.execute(
    `
    SELECT 
        n.id,
        n.user_id,
        n.type,
        n.reference_id,
        n.is_read,
        n.created_at,

        u.name AS name,
        u.email AS email

    FROM notifications n
    JOIN users u
      ON u.id = n.user_id

    WHERE n.id = ?
    `,
    [notificationId]
  );

  return notification;
}




 export async function markNotificationAsReadByReference(
  userId,
  type,
  referenceId
) {
  const db = getDB();

  await db.execute(
    `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = ?
      AND type = ?
      AND reference_id = ?
    `,
    [userId, type, referenceId]
  );
}



 export async function getNotificationsWithCount(userId) {
  const db = getDB();

  // 1️⃣ Notifications + user info
  const [notifications] = await db.execute(
    `
    SELECT 
        n.id,
        n.user_id,
        n.type,
        n.reference_id,
        n.is_read,
        n.created_at,

        u.name AS name,
        u.email AS email

    FROM notifications n
    JOIN users u
      ON u.id = n.user_id

    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    `,
    [userId]
  );

  // 2️⃣ Counts
  const [[counts]] = await db.execute(
    `
    SELECT 
        COUNT(*) AS total,
        SUM(is_read = 0) AS unread
    FROM notifications
    WHERE user_id = ?
    `,
    [userId]
  );

  return {
    notifications,
    total: counts.total,
    unread: counts.unread,
    
  };
}
