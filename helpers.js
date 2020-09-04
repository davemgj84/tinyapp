// function to find user by email within a database:
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Function to help separate urls based on userID:
const urlsForUser = (id, database) => {
  const userUrls = {};
  for (const url in database) {
    if (database[url].userID === id) {
      userUrls[url] = database[url].longURL;
    }
  }
  return userUrls;
};

// Function to generate random 6 character string:
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = { findUserByEmail, urlsForUser, generateRandomString };