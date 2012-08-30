-- calculates the votes column for all comments

UPDATE comments
SET vote = (SELECT SUM(value) FROM votes WHERE votes.comment_id = comments.id);
