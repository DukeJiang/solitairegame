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

describe("User:", () => {
  let primaryAgent = request.agent(),
    anonAgent = request.agent();
  before(done => {
    envConfig("./config/config.json", env).then(conf => {
      config = conf;
      config.url = `${config.url}:${config.port}${config.api_version}/`;
      harness.setup(config.mongodb, done);
    });
  });
  after(done => {
    harness.shutdown(done);
  });

  describe("Create:", () => {
    it("Failure - missing required username", done => {
      primaryAgent
        .post(`${config.url}user`)
        .send({
          first_name: users.primary.first_name,
          last_name: users.primary.last_name
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"username" is required');
          done();
        });
    });
    it("Failure - missing required address", done => {
      primaryAgent
        .post(`${config.url}user`)
        .send({
          first_name: users.primary.first_name,
          last_name: users.primary.last_name,
          username: users.primary.username,
          password: users.primary.password
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"primary_email" is required');
          done();
        });
    });
    it("Failure - missing required password", done => {
      primaryAgent
        .post(`${config.url}user`)
        .send({
          first_name: users.primary.first_name,
          last_name: users.primary.last_name,
          username: users.primary.username,
          primary_email: users.primary.primary_email
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"password" is required');
          done();
        });
    });
    it("Failure - malformed username -- bad chars", done => {
      let data = Object.assign({}, users.primary);
      data.username = "@yys7! foobar";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            '"username" must only contain alpha-numeric characters'
          );
          done();
        });
    });
    it("Failure - malformed username -- reserved word", done => {
      let data = Object.assign({}, users.primary);
      data.username = "password";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("invalid username");
          done();
        });
    });
    it("Failure - malformed address", done => {
      let data = Object.assign({}, users.primary);
      data.primary_email = "not.a.real.address-com";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"primary_email" must be a valid email');
          done();
        });
    });
    it("Failure - malformed password -- too short", done => {
      let data = Object.assign({}, users.primary);
      data.password = "1234567";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            '"password" length must be at least 8 characters long'
          );
          done();
        });
    });
    it("Failure - malformed password -- need at least one uppercase", done => {
      let data = Object.assign({}, users.primary);
      data.password = "!1234asdf";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            'Password must contain an uppercase letter'
          );
          done();
        });
    });
    it("Failure - malformed password -- need at least one lowercase", done => {
      let data = Object.assign({}, users.primary);
      data.password = "!1234ASDF";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            'Password must contain a lowercase letter'
          );
          done();
        });
    });
    it("Failure - malformed password -- need at least one number", done => {
      let data = Object.assign({}, users.primary);
      data.password = "!ASDFasdf";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            'Password must contain a number'
          );
          done();
        });
    });
    it("Failure - malformed password -- need at least one symbol", done => {
      let data = Object.assign({}, users.primary);
      data.password = "1234Asdf";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            'Password must contain @, !, #, $, % or ^'
          );
          done();
        });
    });
    it("Success - return 201 and username and ...", done => {
      primaryAgent
        .post(`${config.url}user`)
        .send(users.primary)
        .end((err, res) => {
          res.status.should.equal(201);
          res.body.username.should.equal(users.primary.username);
          res.body.primary_email.should.equal(users.primary.primary_email);
          // Save the user info
          setTimeout(done, harness.timeout);
        });
    });
    it("Failure - already used username", done => {
      let data = Object.assign({}, users.primary);
      data.primary_email = "randomemailname@randomaddress.com";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("username already in use");
          done();
        });
    });
    it("Failure - case insensitivity", done => {
      let data = Object.assign({}, users.primary);
      data.username = data.username.toUpperCase();
      data.primary_email = "goo@bar.com";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("username already in use");
          done();
        });
    });
    it("Failure - already used email address", done => {
      let data = Object.assign({}, users.primary);
      data.username = "randomusername";
      primaryAgent
        .post(`${config.url}user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("email address already in use");
          done();
        });
    });
  });

  describe("Exists:", () => {
    it("Failure - unknown user", done => {
      primaryAgent.head(`${config.url}user/fakeusername`).end((err, res) => {
        res.status.should.equal(404);
        done();
      });
    });
    it("Success - read existing user profile", done => {
      primaryAgent
        .head(`${config.url}user/${users.primary.username}`)
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });
    it("Success - read existing user profile - case insensitive", done => {
      primaryAgent
        .head(`${config.url}user/${users.primary.username.toUpperCase()}`)
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });
  });

  describe("Read:", () => {
    it("Success - read existing user profile", done => {
      primaryAgent
        .get(`${config.url}user/${users.primary.username}`)
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.username.should.equal(users.primary.username);
          res.body.primary_email.should.equal(users.primary.primary_email);
          res.body.first_name.should.equal(users.primary.first_name);
          res.body.last_name.should.equal(users.primary.last_name);
          res.body.city.should.equal(users.primary.city);
          res.body.games.should.be.instanceof(Array).and.have.lengthOf(0);
          done();
        });
    });
    it("Failure - read non-existent user profile", done => {
      primaryAgent.get(`${config.url}user/foobar`).end((err, res) => {
        res.status.should.equal(404);
        res.body.error.should.equal("unknown user: foobar");
        done();
      });
    });
    it("Success - read user game data", done => {
      done();
    });
  });

  describe("Update:", () => {
    before(cb => {
      // Log primary user in
      harness.login(config.url, primaryAgent, users.primary, cb);
    });
    after(cb => {
      // Log out primary user when done
      harness.logout(config.url, primaryAgent, cb);
    });
    it("Success - update first and last name - return 204", done => {
      primaryAgent
        .put(`${config.url}user`)
        .send({ first_name: "foo2", last_name: "bar2" })
        .end((err, res) => {
          res.status.should.equal(204);
          users.primary.first_name = "foo2";
          users.primary.last_name = "bar2";
          done();
        });
    });
    it("Success - send nothing - return 204", done => {
      primaryAgent.put(`${config.url}user`).end((err, res) => {
        res.status.should.equal(204);
        done();
      });
    });
    it("Success - can not change username, primary_email or non-standard fields - return 204", done => {
      primaryAgent
        .put(`${config.url}user`)
        .send({
          username: "newname",
          primary_email: "something@new.com",
          admin: true
        })
        .end((err, res) => {
          res.status.should.equal(204);
          done();
        });
    });
    it("Failure - not logged in", done => {
      anonAgent
        .put(`${config.url}user`)
        .send({ first_name: "foo2", last_name: "bar2" })
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.error.should.equal("unauthorized");
          done();
        });
    });
  });
});
