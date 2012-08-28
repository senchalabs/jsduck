-- Example queries

-- get comments for a particular member

SELECT *
FROM visible_comments
WHERE domain = ? AND type = ? AND cls = ? AND member = ?;

-- get 100 most recent comments

SELECT *
FROM full_visible_comments
WHERE domain = 'ext-js-4'
ORDER BY created_at DESC
LIMIT 100;

-- get number of comments for each target

SELECT
    type AS type,
    cls AS cls,
    member AS member,
    count(*) AS cnt
FROM full_visible_comments
WHERE domain = 'ext-js-4'
GROUP BY target_id
ORDER BY cnt;

-- get number of comments for each class (including comments for class members)

SELECT
    cls AS cls,
    count(*) AS cnt
FROM full_visible_comments
WHERE domain = 'ext-js-4' AND type = 'class'
GROUP BY cls
ORDER BY cnt;

-- get users with most upvotes

SELECT
    username,
    SUM(vote) AS votes
FROM full_visible_comments
GROUP BY username
ORDER BY votes DESC
LIMIT 10;

-- get users with most downvotes

SELECT
    username,
    SUM(vote) AS votes
FROM full_visible_comments
GROUP BY username
HAVING votes IS NOT NULL
ORDER BY votes ASC
LIMIT 10;

-- get users with most comments

SELECT
    username,
    COUNT(*) AS comment_count
FROM full_visible_comments
GROUP BY username
ORDER BY comment_count DESC
LIMIT 10;

-- get users with most edits

SELECT
    users.username,
    COUNT(*) AS updates_count
FROM users LEFT JOIN updates u ON u.user_id = users.id
GROUP BY users.id
ORDER BY updates_count DESC
LIMIT 10;

-- get all moderators, sorted by comment counts

SELECT
    username,
    COUNT(*) AS comment_count
FROM full_visible_comments
WHERE moderator = 1
GROUP BY username
ORDER BY comment_count DESC;
