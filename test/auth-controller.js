const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const config = require("../utils/config");
const User = require("../models/user");
const AuthControllers = require("../controllers/auth");

const MONGODB_URI = `mongodb://${config.database_username}:${config.database_password}@${config.database_host}:${config.database_port}/${config.test_database_name}?authSource=admin&w=1`;

describe("Auth Controller - Login", function () {
  // Test connection to database fails
  it("Should throw an error with statusCode 500 if accessing the database fails", function () {
    sinon.stub(User, "findOne");
    // stimulate datbase connection fails
    User.findOne.throws();

    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    };

    expect(AuthControllers.login.bind(this, req, {}, () => {})).to.throw();

    // AuthControllers.login(req, {}, () => {}).then((result) => {
    //   console.log(result);
    //   expect(result).to.be.an("error");
    //   expect(result).to.have.property("statusCode", 500);
    //   done();
    // });

    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", function (done) {
    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
          _id: "64b7a53b4f386a39c5cef635",
        });
        return user.save();
      })
      .then(() => {
        const req = { userId: "64b7a53b4f386a39c5cef635" };
        const res = {
          statusCode: 500,
          userStatus: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.userStatus = data.status;
          },
        };

        // running our code
        AuthControllers.getUserStatus(req, res, () => {}).then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userStatus).to.be.equal("New");
          User.deleteMany({})
            .then(() => {
              return mongoose.disconnect();
            })
            .then(() => {
              done();
            });
        });
      })

      .catch((err) => console.log(err));
  });
});
