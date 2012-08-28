CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    external_id INT NOT NULL UNIQUE, -- (link to Sencha Forum database)
    email VARCHAR(255) NOT NULL,
    moderator BOOLEAN NOT NULL DEFAULT 0
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE targets (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(50) NOT NULL, -- combines sdk & version
    type ENUM('class', 'guide', 'video', 'unknown', 'challenge') NOT NULL DEFAULT 'class',
    cls VARCHAR(100) NOT NULL,    -- "Ext.draw.Sprite"
    member VARCHAR(100) NOT NULL, -- "method-setAttributes"
    -- the whole target must be unique
    CONSTRAINT unique_targets UNIQUE KEY (domain, type, cls, member)
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE comments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE votes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    value INT NOT NULL, -- +1 or -1
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    -- can't vote twice on the same comment
    CONSTRAINT unique_votes UNIQUE KEY (user_id, comment_id)
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE updates (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    action ENUM('update', 'delete') DEFAULT 'update',
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE subscriptions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE,
    -- can't subscribe twice to the same thread
    CONSTRAINT unique_subscriptions UNIQUE KEY (user_id, target_id)
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE readings (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    -- can't read the same comment twice
    CONSTRAINT unique_readings UNIQUE KEY (user_id, comment_id)
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE VIEW visible_comments AS SELECT * FROM comments WHERE deleted = 0;

CREATE VIEW voted_comments AS SELECT
    c.*,
    SUM(v.value) AS vote
FROM visible_comments c LEFT JOIN votes v ON c.id = v.comment_id
GROUP BY c.id;

-- comments table joined with users and targets for easier quering
CREATE VIEW full_visible_comments AS SELECT
    c.id,
    c.content,
    c.content_html,
    c.created_at,
    users.username,
    users.external_id,
    users.email,
    users.moderator,
    targets.domain,
    targets.type,
    targets.cls,
    targets.member
FROM visible_comments AS c
    LEFT JOIN users ON c.user_id = users.id
    LEFT JOIN targets ON c.target_id = targets.id;

