DROP TABLE IF EXISTS comment_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS readings;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS updates;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS targets;
DROP TABLE IF EXISTS users;

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
    type ENUM('class', 'guide', 'video') NOT NULL DEFAULT 'class',
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
    vote INT NOT NULL DEFAULT 0,
    tags TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE votes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    value INT NOT NULL, -- +1 or -1
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE subscriptions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE,
    -- can't subscribe twice to the same thread
    CONSTRAINT unique_subscriptions UNIQUE KEY (user_id, target_id)
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE readings (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    -- can't read the same comment twice
    CONSTRAINT unique_readings UNIQUE KEY (user_id, comment_id)
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE tags (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(50) NOT NULL,
    tagname VARCHAR(100) NOT NULL,
    -- unique tags within domain
    CONSTRAINT unique_tags UNIQUE KEY (domain, tagname)
) ENGINE = InnoDB, CHARACTER SET = utf8;

CREATE TABLE comment_tags (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
    -- a comment can't have the same tag twice
    CONSTRAINT unique_comment_tags UNIQUE KEY (tag_id, comment_id)
) ENGINE = InnoDB, CHARACTER SET = utf8;


CREATE OR REPLACE VIEW visible_comments AS SELECT * FROM comments WHERE deleted = 0;

-- comments table joined with users and targets for easier quering
CREATE OR REPLACE VIEW full_visible_comments AS SELECT
    c.*,
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

-- the same as above, but including deleted comments
CREATE OR REPLACE VIEW full_comments AS SELECT
    c.*,
    users.username,
    users.external_id,
    users.email,
    users.moderator,
    targets.domain,
    targets.type,
    targets.cls,
    targets.member
FROM comments AS c
    LEFT JOIN users ON c.user_id = users.id
    LEFT JOIN targets ON c.target_id = targets.id;


-- set up triggers to recalculate the votes column automatically

DROP TRIGGER IF EXISTS on_vote_added;
CREATE TRIGGER on_vote_added AFTER INSERT ON votes
FOR EACH ROW
    UPDATE comments
    SET vote = (SELECT SUM(value) FROM votes WHERE votes.comment_id = comments.id)
    WHERE id = NEW.comment_id;

DROP TRIGGER IF EXISTS on_vote_deleted;
CREATE TRIGGER on_vote_deleted AFTER DELETE ON votes
FOR EACH ROW
    UPDATE comments
    SET vote = (SELECT SUM(value) FROM votes WHERE votes.comment_id = comments.id)
    WHERE id = OLD.comment_id;

-- set up triggers to recalculate the tags column automatically

CREATE OR REPLACE VIEW concatenated_tags AS
    SELECT
        comment_id,
        GROUP_CONCAT(tagname ORDER BY tagname SEPARATOR '\t') AS tagstring
    FROM comment_tags
    JOIN tags on tags.id = comment_tags.tag_id
    GROUP BY comment_id;

DROP TRIGGER IF EXISTS on_tag_added;
CREATE TRIGGER on_tag_added AFTER INSERT ON comment_tags
FOR EACH ROW
    UPDATE comments
    SET tags = (SELECT tagstring FROM concatenated_tags ctags WHERE ctags.comment_id = comments.id)
    WHERE id = NEW.comment_id;

DROP TRIGGER IF EXISTS on_tag_deleted;
CREATE TRIGGER on_tag_deleted AFTER DELETE ON comment_tags
FOR EACH ROW
    UPDATE comments
    SET tags = (SELECT tagstring FROM concatenated_tags ctags WHERE ctags.comment_id = comments.id)
    WHERE id = OLD.comment_id;
