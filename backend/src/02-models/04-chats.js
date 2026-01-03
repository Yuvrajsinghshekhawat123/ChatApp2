 import { getDB } from "../01-config/connectDb.js";

export async function findPrivateChat(loginUserId, targetUserId) {
  const db = getDB();

  const [rows] = await db.execute(
    `
    SELECT c.id AS chatId
    FROM chats c
    JOIN chat_members cm1 ON c.id = cm1.chat_id
    JOIN chat_members cm2 ON c.id = cm2.chat_id
    WHERE c.is_group = 0
      AND cm1.user_id = ?
      AND cm2.user_id = ?
    LIMIT 1
    `,
    [loginUserId, targetUserId]
  );

  if (rows.length > 0) {
    return rows[0]; // { chatId: 500 }
  }

  // If not found → return null
  return null;
}




// creat the priveate chat
export async function createPrivateChatIfNotExists(loginUserId, targetUserId) {
   const db = getDB();

  const [rows] = await db.execute(
    `
    SELECT c.id AS chatId
    FROM chats c
    JOIN chat_members cm1 ON c.id = cm1.chat_id
    JOIN chat_members cm2 ON c.id = cm2.chat_id
    WHERE c.is_group = 0
      AND cm1.user_id = ?
      AND cm2.user_id = ?
    LIMIT 1
    `,
    [loginUserId, targetUserId]
  );


     // 2️⃣ If exists → return chatId
  if (rows.length > 0) {
    return rows[0].chatId;
  }



  // 3️⃣ Else → create new private chat
  const [chatResult] = await db.execute(
    `
    INSERT INTO chats (is_group, creator_id)
    VALUES (0, ?)
    `,
    [loginUserId]
  );



const chatId = chatResult.insertId;

// 4️⃣ Add both users as members
  await db.execute(
    `
    INSERT INTO chat_members (chat_id, user_id)
    VALUES (?, ?), (?, ?)
    `,
    [chatId, loginUserId, chatId, targetUserId]
  );


   // 5️⃣ Return newly created chatId
  return chatId;

}






// all chats of user
  
export async function allChatsOfUser(userId) {
  const db = getDB();

  const [rows] = await db.execute(
    ` SELECT
  c.id AS id,

  u.id AS userId,
  u.name,
  u.avatar,

  'single' AS type,
  FALSE AS isOnline,

  lm.content AS lastMessage,
  lm.created_at AS time,

  SUM(
    CASE
      WHEN mr.message_id IS  NULL
           AND m.sender_id != ?
      THEN 1
      ELSE 0
    END
  ) AS unreadCount
FROM chats c

-- logged-in user
JOIN chat_members cm1
  ON cm1.chat_id = c.id
 AND cm1.user_id = ?

-- other user
JOIN chat_members cm2
  ON cm2.chat_id = c.id
 AND cm2.user_id != ?

JOIN users u
  ON u.id = cm2.user_id

-- all messages (for unread count)
LEFT JOIN messages m
  ON m.chat_id = c.id

LEFT JOIN message_reads mr
  ON mr.message_id = m.id
 AND mr.user_id = ?

-- last message per chat (safe, single row)
LEFT JOIN messages lm
  ON lm.id = (
    SELECT id
    FROM messages
    WHERE chat_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  )

WHERE c.is_group = 0

GROUP BY
  c.id,
  u.id,
  u.name,
  u.avatar,
  lm.content,
  lm.created_at

ORDER BY time DESC;
`,
    [userId, userId, userId, userId]
  );

  return rows;
}




/*
ex
{
  "chatId": 12,
  "userId": 5,
  "name": "Aman",
  "avatar": "aman.png",
  "type": "private",
  "lastMessage": "Hey, how are you?",
  "time": "2025-01-01T10:30:00.000Z",
  "unreadCount": 3,
  "isOnline": 1
}
*/

 function toMySQLDate(iso) {
   const d = new Date(iso);
  d.setMinutes(d.getMinutes() + 330); // IST offset
  return d.toISOString().slice(0,19).replace("T"," ");
}



   export async function fetchMessages(chatId, userId, cursor) {
  const db = getDB();

  const cursorTime = cursor?.time
    ? toMySQLDate(cursor.time)
    : null;
  const cursorId = cursor?.id ?? null;

  const [messages] = await db.execute(
    `
    SELECT 
      m.id,
      m.chat_id,
      m.sender_id,
      m.content,
      m.created_at,

      CASE 
        WHEN mr.user_id IS NULL THEN 0
        ELSE 1
      END AS is_read

    FROM messages m
    LEFT JOIN message_reads mr
      ON mr.message_id = m.id
     AND mr.user_id = ?

    WHERE m.chat_id = ?
      AND (
        ? IS NULL OR
        (m.created_at < ? OR (m.created_at = ? AND m.id < ?))
      )

    ORDER BY m.created_at DESC, m.id DESC
    LIMIT 20
    `,
    [
      userId,
      chatId,
      cursorTime,
      cursorTime,
      cursorTime,
      cursorId,
    ]
  );

  if (messages.length === 0) {
    return { messages: [], nextCursor: null };
  }

  const messageIds = messages.map((m) => m.id);

  /* ---------- ATTACHMENTS ---------- */
  let attachments = [];
  if (messageIds.length > 0) {
    const placeholders = messageIds.map(() => "?").join(",");

    const [rows] = await db.execute(
      `
      SELECT id, message_id, url, type
      FROM message_attachments
      WHERE message_id IN (${placeholders})
      `,
      messageIds
    );

    attachments = rows;
  }

  const attachmentMap = {};
  attachments.forEach((a) => {
    if (!attachmentMap[a.message_id]) {
      attachmentMap[a.message_id] = [];
    }
    attachmentMap[a.message_id].push(a);
  });

  const finalMessages = messages.map((m) => ({
    ...m,
    attachments: attachmentMap[m.id] || [],
  }));

  const last = messages[messages.length - 1];

  return {
    messages: finalMessages,
    nextCursor: {
      time: last.created_at,
      id: last.id,
    },
  };
}



/*
 



{
  "success": true,
  "messages": [
    {
      "id": 101,
      "chat_id": 12,
      "sender_id": 4,
      "content": "Hello 👋",
      "created_at": "2025-02-12T10:41:30.630Z",
      "is_read": 1,
      "attachments": []
    }
  ],
  "nextCursor": "2025-02-12T10:41:30.630Z"
}


*/





export async function getChatMembers(chatId) {
  const db = getDB();

  const [rows] = await db.execute(
    `
    SELECT user_id
    FROM chat_members
    WHERE chat_id = ?
      
    `,
    [chatId]
  );

  return rows.map(r => r.user_id);
}
