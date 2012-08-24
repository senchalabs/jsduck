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
    users.username,
    SUM(c.vote) AS votes
FROM users LEFT JOIN voted_comments c ON c.user_id = users.id
GROUP BY users.id
ORDER BY votes DESC
LIMIT 10;

