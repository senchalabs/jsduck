-- calculates the votes column for all comments

UPDATE comments
SET vote = (SELECT SUM(value) FROM votes WHERE votes.comment_id = comments.id);


-- set up a trigger to recalculate the votes column automatically

CREATE TRIGGER on_vote_added AFTER INSERT ON votes
FOR EACH ROW
    UPDATE comments
    SET vote = (SELECT SUM(value) FROM votes WHERE votes.comment_id = comments.id)
    WHERE id = NEW.comment_id;

CREATE TRIGGER on_vote_deleted AFTER DELETE ON votes
FOR EACH ROW
    UPDATE comments
    SET vote = (SELECT SUM(value) FROM votes WHERE votes.comment_id = comments.id)
    WHERE id = OLD.comment_id;
