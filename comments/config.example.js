
module.exports = {
    sessionSecret: 'blahblahblah',
    port: 3000,

    // local comments database
    mysql: {
        user: "",
        password: "",
        database: "comments",
        host: "localhost"
    },

    // Sencha Forum database
    forumDb: {
        user: '',
        password: '',
        host: '',
        database: ''
    },

    // old MongoDB database
    mongoDb: 'mongodb://localhost:27017/comments'
};
