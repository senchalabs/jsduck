CREATE TABLE comments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    rating INT NOT NULL DEFAULT 0,
    deleted ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (target_id) REFERENCES targets (id)
);

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL, -- (from subscriptions)
    email_hash VARCHAR(255) NOT NULL,
    moderator ENUM('Y', 'N') NOT NULL DEFAULT 'N'
);

CREATE TABLE targets (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sdk VARCHAR(255) NOT NULL,
    version VARCHAR(255) NOT NULL,
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


