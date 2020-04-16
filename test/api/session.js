/* Copyright G. Hemingway, 2020 - All rights reserved */
"use strict";

const should = require("should");
const assert = require("assert");
const request = require("superagent");
const harness = require("./harness");
const data = require("./data");
let config = {};
let users = data.users;
const envConfig = require("simple-env-config");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "test";

/**************************************************************************/

describe("Session:", () => {
  let primaryAgent = request.agent(),
    anonAgent = request.agent();
  before(done => {
    envConfig("./config/config.json", env).then(conf => {
      config = conf;
      config.url = `${config.url}:${config.port}${config.api_version}/`;
      harness.setup(config.mongodb, () => {
        // Create a user for session testing
        harness.createUser(config.url, users.primary, () => {
          done();
        });
      });
    });
  });
  after(done => {
    harness.shutdown(done);
  });

  describe("Log in:", () => {
    it("Failure - missing username", done => {
      primaryAgent
        .post(`${config.url}session`)
        .send({
          password: "whattheduck"
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(`"username" is required`);
          done();
        });
    });
    it("Failure - missing password", done => {
      primaryAgent
        .post(`${config.url}session`)
        .send({
          username: "whattheduck"
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(`"password" is required`);
          done();
        });
    });
    it("Failure - unknown user", done => {
      primaryAgent
        .post(`${config.url}session`)
        .send({
          username: "whattheduck",
          password: users.primary.password
        })
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.error.should.equal(`unauthorized`);
          done();
        });
    });
    it("Failure - wrong password", done => {
      primaryAgent
        .post(`${config.url}session`)
        .send({
          username: users.primary.username,
          password: "whattheduck"
        })
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.error.should.equal(`unauthorized`);
          done();
        });
    });
    it("Success - log in user", done => {
      primaryAgent
        .post(`${config.url}session`)
        .send({
          username: users.primary.username,
          password: users.primary.password
        })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.username.should.equal(users.primary.username);
          res.body.primary_email.should.equal(users.primary.primary_email);
          done();
        });
    });
  });

  describe("Log out:", () => {
    it("Success - log out logged in user", done => {
      primaryAgent.del(`${config.url}session`).end((err, res) => {
        res.status.should.equal(204);
        done();
      });
    });
    it("Success - call logout on not logged in user", done => {
      anonAgent.del(`${config.url}session`).end((err, res) => {
        res.status.should.equal(200);
        done();
      });
    });
  });
});
