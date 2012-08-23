CREATE TABLE comments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    deleted ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (target_id) REFERENCES targets (id)
);

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    external_id INT NOT NULL, -- (link to Sencha Forum database)
    email VARCHAR(255) NOT NULL, -- (from subscriptions)
    email_hash VARCHAR(255) NOT NULL,
    moderator ENUM('Y', 'N') NOT NULL DEFAULT 'N'
);

CREATE TABLE targets (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) NOT NULL, -- combines sdk & version
    type ENUM('class', 'guide', 'video') NOT NULL DEFAULT 'class',
    cls VARCHAR(255) NOT NULL,    -- "Ext.draw.Sprite"
    member VARCHAR(255) NOT NULL  -- "method-setAttributes"
);

CREATE TABLE votes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    value INT NOT NULL, -- +1 or -1
    created_at DATETIME NOT NULL, -- (no data available for now)
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id)
);

CREATE TABLE updates (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    action ENUM('update', 'delete') DEFAULT 'update',
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id)
);

CREATE TABLE subscriptions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    created_at DATETIME NOT NULL, -- (no data available for now)
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (target_id) REFERENCES targets (id)
);

CREATE TABLE read_comments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    created_at DATETIME NOT NULL, -- (no data available for now)
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (comment_id) REFERENCES comments (id)
);

CREATE VIEW visible_comments AS SELECT * FROM comments WHERE deleted = 'N';

CREATE VIEW voted_comments AS SELECT
    c.*,
    SUM(v.value) AS vote
FROM visible_comments c LEFT JOIN votes v ON c.id = v.comment_id;

-- Example queries

-- get comments for a particular member

SELECT * FROM visible_comments c JOIN targets ON c.target_id = targets.id
WHERE targets.domain = ? AND targets.type = ? AND targets.cls = ? AND targets.member = ?

-- get 100 most recent comments

SELECT * FROM visible_comments c JOIN targets ON c.target_id = targets.id
WHERE targets.domain = ?
ORDER BY created_at DESC LIMIT 100

-- get number of comments for each target

SELECT
    target.type AS type,
    target.cls AS cls,
    target.member AS member,
    count(*) AS cnt
FROM visible_comments c JOIN targets ON c.target_id = targets.id
WHERE target.domain = ?
GROUP BY target.id

-- get number of comments for each class (including comments for class members)

SELECT
    target.cls AS cls,
    count(*) AS cnt
FROM visible_comments c JOIN targets ON c.target_id = targets.id
WHERE target.domain = ? AND target.type = 'class'
GROUP BY target.cls

-- get users with most upvotes

SELECT
    user.username,
    SUM(c.vote) AS votes
FROM users JOIN voted_comments c ON c.user_id = users.id
GROUP BY user.id
ORDER BY votes DESC

