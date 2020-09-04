const { assert } = require('chai');
const { findUserByEmail } = require('../helpers');

// Mock user database for testing:
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "1@mail.com",
    password: "$2b$10$ga/wgOlNeF3DqB91Xc/x5unIcYeaCUYXHqjIgZiG0u1NcnfIyUdqS"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "2@mail.com",
    password: "$2b$10$ga/wgOlNeF3DqB91Xc/x5unIcYeaCUYXHqjIgZiG0u1NcnfIyUdqS"
  }
};

// Tests for helper function findUserByEmail:
describe('findUserByEmail', function() {

  it('should return a user object a with valid email', () => {
    const user = findUserByEmail("1@mail.com", users);
    const expectedOutput = {
      id: 'userRandomID',
      email: '1@mail.com',
      password:
        '$2b$10$ga/wgOlNeF3DqB91Xc/x5unIcYeaCUYXHqjIgZiG0u1NcnfIyUdqS'
    };
    assert.deepEqual(user, expectedOutput);
  });

  it('should return null if email is non-existent', () => {
    const user = findUserByEmail("doesNotExist@mail.com", users);
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });

});