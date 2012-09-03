-- users

INSERT INTO users SET `id` = 1, `username` = 'renku', `external_id` = 100, `email` = 'renku@example.com', `moderator` = 1;
INSERT INTO users SET `id` = 2, `username` = 'john',  `external_id` = 200, `email` = 'john@example.com',  `moderator` = 0;
INSERT INTO users SET `id` = 3, `username` = 'mary',  `external_id` = 300, `email` = 'mary@example.com',  `moderator` = 0;
INSERT INTO users SET `id` = 4, `username` = 'jack',  `external_id` = 400, `email` = 'jack@example.com',  `moderator` = 0;
INSERT INTO users SET `id` = 5, `username` = 'triin', `external_id` = 500, `email` = 'triin@example.com', `moderator` = 1;
INSERT INTO users SET `id` = 6, `username` = 'xxx',   `external_id` = 600, `email` = 'xxx@example.com',   `moderator` = 0;
INSERT INTO users SET `id` = 7, `username` = 'lurk',  `external_id` = 700, `email` = 'lurk@example.com',  `moderator` = 0;


-- targets

INSERT INTO targets SET `id` = 1,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext',        `member` = '';
INSERT INTO targets SET `id` = 2,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext',        `member` = 'property-BLANK_IMAGE_URL';
INSERT INTO targets SET `id` = 3,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext',        `member` = 'property-log';
INSERT INTO targets SET `id` = 4,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext',        `member` = 'method-getBody';
INSERT INTO targets SET `id` = 5,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext',        `member` = 'method-urlDecode';
INSERT INTO targets SET `id` = 6,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'String',     `member` = 'method-replace';
INSERT INTO targets SET `id` = 7,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'String',     `member` = 'method-localeCompare';
INSERT INTO targets SET `id` = 8,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext.Img',    `member` = '';
INSERT INTO targets SET `id` = 9,  `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext.Img',    `member` = 'method-setSrc';
INSERT INTO targets SET `id` = 10, `domain` = 'ext-js-4', `type` = 'class', `cls` = 'Ext.Img',    `member` = 'cfg-alt';
INSERT INTO targets SET `id` = 11, `domain` = 'ext-js-4', `type` = 'guide', `cls` = 'testing',    `member` = '';
INSERT INTO targets SET `id` = 12, `domain` = 'ext-js-4', `type` = 'guide', `cls` = 'tree',       `member` = '';
INSERT INTO targets SET `id` = 13, `domain` = 'ext-js-4', `type` = 'video', `cls` = '17666102',   `member` = '';
INSERT INTO targets SET `id` = 14, `domain` = 'touch-2',  `type` = 'class', `cls` = 'Ext',        `member` = '';
INSERT INTO targets SET `id` = 15, `domain` = 'touch-2',  `type` = 'class', `cls` = 'Ext',        `member` = 'method-getBody';
INSERT INTO targets SET `id` = 16, `domain` = 'touch-2',  `type` = 'class', `cls` = 'Ext.data.Model', `member` = 'static-method-load';
INSERT INTO targets SET `id` = 17, `domain` = 'touch-2',  `type` = 'guide', `cls` = 'forms',      `member` = '';


-- comments

-- Ext
INSERT INTO comments SET `id` = 1, `user_id` = 1, `target_id` = 1, `content` = 'Not all classes inherit from Ext.Base.', `created_at` = '2011-09-29 13:42:11';
INSERT INTO comments SET `id` = 2, `user_id` = 2, `target_id` = 1, `content` = 'Please give an example.', `created_at` = '2011-09-29 15:30:00';
INSERT INTO comments SET `id` = 3, `user_id` = 3, `target_id` = 1, `content` = 'Yeah, an example please.', `created_at` = '2011-09-29 17:01:12';
INSERT INTO comments SET `id` = 4, `user_id` = 1, `target_id` = 1, `content` = 'A few core classes do not.', `created_at` = '2011-09-30 09:54:05';
INSERT INTO comments SET `id` = 5, `user_id` = 3, `target_id` = 1, `content` = 'Thanks!', `created_at` = '2011-10-02 14:11:51';
INSERT INTO comments SET `id` = 6, `user_id` = 6, `target_id` = 1, `content` = 'Crap!Crap!Crap!', `created_at` = '2011-10-03 08:12:33', `deleted` = 1;

-- Ext#BLANK_IMAGE_URL
INSERT INTO comments SET `id` = 7, `user_id` = 2, `target_id` = 2, `content` = 'What is the default?', `created_at` = '2012-01-01 00:00:00';
INSERT INTO comments SET `id` = 8, `user_id` = 4, `target_id` = 2, `content` = 'Read the source...', `created_at` = '2012-01-02 00:00:00';

-- Ext#log
INSERT INTO comments SET `id` = 9, `user_id` = 6, `target_id` = 3, `content` = 'WTF!', `created_at` = '2012-01-02 00:00:00', `deleted` = 1;

-- Ext#getBody
INSERT INTO comments SET `id` = 10, `user_id` = 4, `target_id` = 4, `content` = 'returns document.body.', `created_at` = '2012-01-10 00:00:00';
INSERT INTO comments SET `id` = 11, `user_id` = 5, `target_id` = 4, `content` = '**Fixed internally.**', `created_at` = '2012-01-15 00:00:00';

-- Ext#urlDecode
INSERT INTO comments SET `id` = 12, `user_id` = 2, `target_id` = 5, `content` = 'Returns string not object.', `created_at` = '2012-01-12 00:00:00';
INSERT INTO comments SET `id` = 13, `user_id` = 1, `target_id` = 5, `content` = '**Fixed internally.**', `created_at` = '2012-01-16 00:00:00';

-- String#replace
INSERT INTO comments SET `id` = 14, `user_id` = 3, `target_id` = 6, `content` = 'Takes a regex.', `created_at` = '2012-02-05 00:00:00';

-- String#localeCompare
INSERT INTO comments SET `id` = 15, `user_id` = 2, `target_id` = 7, `content` = 'Does not work.', `created_at` = '2012-02-06 00:00:00';
INSERT INTO comments SET `id` = 16, `user_id` = 3, `target_id` = 7, `content` = 'For me neither.', `created_at` = '2012-02-07 00:00:00';
INSERT INTO comments SET `id` = 17, `user_id` = 1, `target_id` = 7, `content` = 'Not really a Sencha problem.', `created_at` = '2012-02-12 00:00:00';

-- Ext.Img
INSERT INTO comments SET `id` = 18, `user_id` = 2, `target_id` = 8, `content` = 'Why would I use this?', `created_at` = '2012-02-18 00:00:00';

-- Ext.Img#setSrc
INSERT INTO comments SET `id` = 19, `user_id` = 2, `target_id` = 9, `content` = 'Why is there no getSrc?', `created_at` = '2012-02-18 00:00:00';
INSERT INTO comments SET `id` = 20, `user_id` = 1, `target_id` = 9, `content` = '**Fixed internally.**', `created_at` = '2012-02-19 00:00:00';

-- Ext.Img#alt
INSERT INTO comments SET `id` = 21, `user_id` = 4, `target_id` = 10, `content` = 'Does not show up when hovering.', `created_at` = '2012-03-01 00:00:00';
INSERT INTO comments SET `id` = 22, `user_id` = 2, `target_id` = 10, `content` = 'Use title for that.', `created_at` = '2012-03-03 00:00:00';
INSERT INTO comments SET `id` = 23, `user_id` = 4, `target_id` = 10, `content` = 'Thanks.', `created_at` = '2012-03-04 00:00:00';

-- guide:testing
INSERT INTO comments SET `id` = 24, `user_id` = 3, `target_id` = 11, `content` = 'Example has trailing comma.', `created_at` = '2012-05-12 00:00:00';

-- guide:tree
INSERT INTO comments SET `id` = 25, `user_id` = 6, `target_id` = 12, `content` = 'Useless!', `created_at` = '2012-05-14 00:00:00', deleted = 1;

-- video:17666102
INSERT INTO comments SET `id` = 26, `user_id` = 4, `target_id` = 13, `content` = 'Video does not work.', `created_at` = '2012-05-18 00:00:00';
INSERT INTO comments SET `id` = 27, `user_id` = 5, `target_id` = 13, `content` = 'Vimeo server was down.', `created_at` = '2012-05-20 00:00:00';

-- touch-2 Ext
INSERT INTO comments SET `id` = 28, `user_id` = 2, `target_id` = 14, `content` = 'The core of it all.', `created_at` = '2012-02-11 00:00:00';

-- touch-2 Ext#getBody
INSERT INTO comments SET `id` = 29, `user_id` = 3, `target_id` = 15, `content` = 'See ExtJS docs.', `created_at` = '2012-02-18 00:00:00';

-- touch-2 Ext.data.Model#load
INSERT INTO comments SET `id` = 30, `user_id` = 2, `target_id` = 16, `content` = 'Use the params config.', `created_at` = '2012-03-01 00:00:00';

-- touch-2 guide:forms
INSERT INTO comments SET `id` = 31, `user_id` = 6, `target_id` = 17, `content` = 'Holy crap!', `created_at` = '2012-05-20 00:00:00';


-- votes

-- +4 votes to renku in Ext thread
INSERT INTO votes SET `user_id` = 2, `comment_id` = 1, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 3, `comment_id` = 1, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 4, `comment_id` = 1, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 7, `comment_id` = 1, `value` = 1, `created_at` = '2011-01-01 00:00:00';

-- 2-1 votes to john in Ext thread
INSERT INTO votes SET `user_id` = 3, `comment_id` = 2, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 6, `comment_id` = 2, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 7, `comment_id` = 2, `value` = 1, `created_at` = '2011-01-01 00:00:00';

-- -3 votes to xxx in Ext thread
INSERT INTO votes SET `user_id` = 3, `comment_id` = 6, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 2, `comment_id` = 6, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 7, `comment_id` = 6, `value` = -1, `created_at` = '2011-01-01 00:00:00';

-- +2 votes to john in Ext#BLANK_IMAGE_URL
INSERT INTO votes SET `user_id` = 7, `comment_id` = 7, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 1, `comment_id` = 7, `value` = 1, `created_at` = '2011-01-01 00:00:00';

-- 1-2 votes to renku in String#localeCompare
INSERT INTO votes SET `user_id` = 5, `comment_id` = 15, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 6, `comment_id` = 15, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 2, `comment_id` = 15, `value` = -1, `created_at` = '2011-01-01 00:00:00';

-- +1 votes to john in Ext.Img#setSrc
INSERT INTO votes SET `user_id` = 1, `comment_id` = 19, `value` = 1, `created_at` = '2011-01-01 00:00:00';

-- +2 votes to mary in guide:testing
INSERT INTO votes SET `user_id` = 4, `comment_id` = 24, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 2, `comment_id` = 24, `value` = 1, `created_at` = '2011-01-01 00:00:00';

-- 3-1 votes to jack in video:17666102
INSERT INTO votes SET `user_id` = 2, `comment_id` = 25, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 3, `comment_id` = 25, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 7, `comment_id` = 25, `value` = 1, `created_at` = '2011-01-01 00:00:00';

-- +3 votes to john in touch-2 Ext#getBody
INSERT INTO votes SET `user_id` = 1, `comment_id` = 29, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 5, `comment_id` = 29, `value` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 7, `comment_id` = 29, `value` = 1, `created_at` = '2011-01-01 00:00:00';

-- -6 votes to xxx in touch-2 guide:forms
INSERT INTO votes SET `user_id` = 1, `comment_id` = 31, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 2, `comment_id` = 31, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 3, `comment_id` = 31, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 4, `comment_id` = 31, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 5, `comment_id` = 31, `value` = -1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO votes SET `user_id` = 7, `comment_id` = 31, `value` = -1, `created_at` = '2011-01-01 00:00:00';


-- updates

-- have several updates to the very first post
INSERT INTO updates SET `user_id` = 1, `comment_id` = 1, `action` = 'update', `created_at` = '2011-09-29 13:43:12';
INSERT INTO updates SET `user_id` = 1, `comment_id` = 1, `action` = 'update', `created_at` = '2011-09-29 13:43:55';
INSERT INTO updates SET `user_id` = 1, `comment_id` = 1, `action` = 'update', `created_at` = '2011-09-29 13:51:31';

-- have a delete update for all deleted posts
INSERT INTO updates SET `user_id` = 1, `comment_id` = 6,  `action` = 'delete', `created_at` = '2011-10-05 00:00:00';
INSERT INTO updates SET `user_id` = 5, `comment_id` = 9,  `action` = 'delete', `created_at` = '2012-01-08 00:00:00';
INSERT INTO updates SET `user_id` = 6, `comment_id` = 25, `action` = 'delete', `created_at` = '2012-05-20 00:00:00';


-- subscriptions

-- subscribe renku to Ext & Ext.Img
INSERT INTO subscriptions SET `user_id` = 1, `target_id` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO subscriptions SET `user_id` = 1, `target_id` = 8, `created_at` = '2011-01-01 00:00:00';

-- subscribe john to Ext & String#replace
INSERT INTO subscriptions SET `user_id` = 2, `target_id` = 1, `created_at` = '2011-01-01 00:00:00';
INSERT INTO subscriptions SET `user_id` = 2, `target_id` = 6, `created_at` = '2011-01-01 00:00:00';

-- subscribe mary to Ext
INSERT INTO subscriptions SET `user_id` = 3, `target_id` = 1, `created_at` = '2011-01-01 00:00:00';

-- subscribe jack to touch-2 Ext
INSERT INTO subscriptions SET `user_id` = 4, `target_id` = 14, `created_at` = '2011-01-01 00:00:00';

