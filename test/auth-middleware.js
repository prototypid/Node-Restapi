const expect = require("chai").expect;
const authMiddleware = require("../middleware/is-auth");

describe("Auth middleware", function () {
  it("Should throw error if no Authorization header is present.", function () {
    const req = {
      get: function () {
        return null;
      },
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated."
    );
  });

  it("Should throw an error if the authorization header is only one string", function () {
    const req = {
      get: function () {
        return "xyz";
      },
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
