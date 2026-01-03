USE chatApp;

-- =========================
-- 1. USERS
-- =========================
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255),
  avatar_public_id VARCHAR(255),
  avatar VARCHAR(100),
  mobile VARCHAR(10),
  verify_email TINYINT(1) DEFAULT 0,
  last_login_date DATE,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB;





-- =========================
-- 2. CHATS
-- =========================
CREATE TABLE IF NOT EXISTS chats (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100),
  is_group TINYINT(1) DEFAULT 0,
  creator_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY creator_id (creator_id),
  CONSTRAINT chats_ibfk_1
    FOREIGN KEY (creator_id)
    REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- 3. CHAT MEMBERS (M:N)
-- =========================
CREATE TABLE IF NOT EXISTS chat_members (
  chat_id INT NOT NULL,
  user_id INT NOT NULL,
  nickname VARCHAR(100),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_id, user_id),
  KEY user_id (user_id),
  CONSTRAINT chat_members_ibfk_1
    FOREIGN KEY (chat_id)
    REFERENCES chats (id)
    ON DELETE CASCADE,
  CONSTRAINT chat_members_ibfk_2
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- 4. MESSAGES
-- =========================
CREATE TABLE IF NOT EXISTS messages (
  id INT NOT NULL AUTO_INCREMENT,
  chat_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  client_message_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY client_message_id (client_message_id),
  KEY chat_id (chat_id),
  KEY sender_id (sender_id),
  CONSTRAINT messages_ibfk_1
    FOREIGN KEY (chat_id)
    REFERENCES chats (id)
    ON DELETE CASCADE,
  CONSTRAINT messages_ibfk_2
    FOREIGN KEY (sender_id)
    REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;


/*
A message is UNREAD if there is NO row for that user in message_reads.
A message is READ if there IS a row.
*/
CREATE TABLE message_reads (
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



CREATE TABLE message_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,

  public_id VARCHAR(255) NOT NULL,   -- 🔑 IMPORTANT
  url TEXT NOT NULL,

  type ENUM('image','video','file','audio') NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);



-- =========================
-- 5. FRIEND REQUESTS
-- =========================
CREATE TABLE IF NOT EXISTS friend_requests (
  id INT NOT NULL AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY sender_receiver (sender_id, receiver_id),
  KEY receiver_id (receiver_id),
  CONSTRAINT friend_requests_ibfk_1
    FOREIGN KEY (sender_id)
    REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT friend_requests_ibfk_2
    FOREIGN KEY (receiver_id)
    REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;






CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM(
    'friend_request',
    'request_accepted',
    'group_invite',
    'system'
  ) NOT NULL,
  reference_id INT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);









-- =========================
-- 6. SESSIONS
-- =========================
 CREATE TABLE sessions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  valid TINYINT(1) DEFAULT 1,
  user_agent TEXT,
  ip VARCHAR(45),
  refresh_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT sessions_ibfk_1
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- 7. EMAIL VERIFICATION
-- =========================
CREATE TABLE emailverification (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  isVerified TINYINT(1) DEFAULT 0,
  expiresAt DATETIME NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB;

-- =========================
-- 8. FORGOT PASSWORD
-- =========================
CREATE TABLE forgot_password (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT,
  otp VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY user_id (user_id),
  CONSTRAINT forgot_password_ibfk_1
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;







 