const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../models/user");
const AuthControllers = require("../controllers/auth");

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

