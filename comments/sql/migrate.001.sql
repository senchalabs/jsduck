-- Add new column and related tables

ALTER TABLE comments ADD COLUMN tags TEXT NOT NULL DEFAULT '' AFTER vote;

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


-- recreate all old views

CREATE OR REPLACE VIEW visible_comments AS SELECT * FROM comments WHERE deleted = 0;

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


-- add new view and triggers

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


-- Remove unused target types

DELETE FROM targets WHERE type = 'unknown' OR type = 'challenge';

ALTER TABLE targets MODIFY COLUMN type ENUM('class', 'guide', 'video') NOT NULL DEFAULT 'class';
