 import { getDB } from "../01-config/connectDb.js";

export async function findAnyFriendRequest(userId1, userId2) {
  const db = getDB();

  const [rows] = await db.execute(
    `SELECT id, sender_id, receiver_id, status
     FROM friend_requests
     WHERE
       (sender_id = ? AND receiver_id = ?)
        OR
       (sender_id = ? AND receiver_id = ?)
       AND status = 'pending'
     LIMIT 1`,
    [userId1, userId2, userId2, userId1]
  );

  return rows[0] || null;
}

/*
Q 🔁 Why do we need the SECOND condition?
        (sender_id = ? AND receiver_id = ?)


Imagine WhatsApp:

You send a request to someone
Before sending, WhatsApp checks:
    1️⃣ Did you already send a request?
    2️⃣ Did they already send you a request?
Both must be checked.





friend_requests table
| sender_id | receiver_id | status  |
| --------- | ----------- | ------- |
| 5         | 4           | pending |

Now user 4 tries to send request to 5

What happens if we check only ONE direction?
❌ This condition:

    sender_id = 4 AND receiver_id = 5

    ➡️ NO ROW FOUND
    ➡️ System thinks request doesn’t exist ❌
    ➡️ Duplicate / conflict happens
*/




export async function getFriendRequestById(requestId) {
  const db = getDB();
  const [row]=await db.execute(`
    select * from friend_requests where id=?
  `,[requestId]);

  return row[0];
}



export async function findAnyPendingRequest(userId1, userId2) {
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





export async function updateRequestStatus(reference_id,isStatus) {
  const db = getDB();
  await db.execute(` UPDATE friend_requests
SET status = ?
WHERE id = ?;
`,[isStatus,reference_id])
}