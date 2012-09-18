describe("Subscriptions", function() {
    var mysql = require("mysql");
    var Subscriptions = require("../lib/subscriptions");
    var DbFacade = require('../lib/db_facade');
    var config = require('../config');
    var connection;
    var subscriptions;

    beforeEach(function() {
        connection = mysql.createConnection(config.testDb);

        subscriptions = new Subscriptions(new DbFacade(connection), "ext-js-4");
    });

    afterEach(function() {
        connection.end();
    });

    it("#findTargetsByUser returns empty array when user has no subscriptions in current domain", function(done) {
        subscriptions.findTargetsByUser(4, function(err, subs) {
            expect(subs.length).toEqual(0);
            done();
        });
    });

    it("#findTargetsByUser returns all subscription targets of a user", function(done) {
        subscriptions.findTargetsByUser(1, function(err, subs) {
            expect(subs.length).toEqual(2);
            done();
        });
    });

    it("#findTargetsByUser returns subscription target type, cls & member fields", function(done) {
        subscriptions.findTargetsByUser(3, function(err, subs) {
            expect(subs[0].type).toEqual("class");
            expect(subs[0].cls).toEqual("Ext");
            expect(subs[0].member).toEqual("");
            done();
        });
    });

    it("#findUsersByTarget returns empty array when no subscriptions to a target", function(done) {
        subscriptions.findUsersByTarget(2, function(err, subs) {
            expect(subs.length).toEqual(0);
            done();
        });
    });

    it("#findUsersByTarget returns all users who have subscribed to a particular target", function(done) {
        subscriptions.findUsersByTarget(1, function(err, subs) {
            expect(subs.length).toEqual(3);
            done();
        });
    });

    it("#findUsersByTarget returns username and email fields", function(done) {
        subscriptions.findUsersByTarget(8, function(err, subs) {
            expect(subs[0].username).toEqual("renku");
            expect(subs[0].email).toEqual("renku@example.com");
            done();
        });
    });

    it("#findImplicitSubscribersByTarget returns username and email fields", function(done) {
        subscriptions.findImplicitSubscribersByTarget(1, function(err, users) {
            expect(users.map(function(u){return u.username;})).toEqual(["renku", "john", "mary"]);
            done();
        });
    });

    it("#add adds new subscription", function(done) {
        subscriptions.add({user_id: 1, target: {type: "guide", cls: "testing", member: ""}}, function(err, id) {
            subscriptions.findTargetsByUser(1, function(err, subs) {
                expect(subs.length).toEqual(3);
                done();
            });
        });
    });

    it("#add does nothing when subscription already exists", function(done) {
        subscriptions.add({user_id: 1, target: {type: "guide", cls: "testing", member: ""}}, function(err, id) {
            subscriptions.findTargetsByUser(1, function(err, subs) {
                expect(subs.length).toEqual(3);
                done();
            });
        });
    });

    it("#remove removes existing subscription", function(done) {
        subscriptions.remove({user_id: 1, target: {type: "guide", cls: "testing", member: ""}}, function(err, id) {
            subscriptions.findTargetsByUser(1, function(err, subs) {
                expect(subs.length).toEqual(2);
                done();
            });
        });
    });

    it("#remove does nothing when subscription doesn't exist", function(done) {
        subscriptions.remove({user_id: 1, target: {type: "guide", cls: "testing", member: ""}}, function(err, id) {
            subscriptions.findTargetsByUser(1, function(err, subs) {
                expect(subs.length).toEqual(2);
                done();
            });
        });
    });
});
