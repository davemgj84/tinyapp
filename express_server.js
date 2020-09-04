// TinyApp Server:

// Bringing in everything required below (ports, modules, etc):
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { findUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

// Setting up middleware for app to use:
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["key"]
}));

// Setting up express engine:
app.set("view engine", "ejs");

// initial server setup tests:
app.get("/", (req, res) => {
  res.redirect('/login');
});

// initial server setup tests:
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// initial server setup tests:
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// URL Database Object that stores our key value pairs (short URL and Long URL) - **EXAMPLE** - the users in the static database are placeholders - to test create new user(register):
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

// Creating a user object to store user database: - **EXAMPLE** - New users only work now due to bcrypt - These users are placeholders, nothing more:
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

// get request to show index/collection of urls:
app.get("/urls", (req, res) => {
  const userID = req.session.id;
  let templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

// get request to show new url input at /urls/new - use cookies:
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.id] };
  res.render("urls_new", templateVars);
});

// get request to show register page:
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.id] };
  res.render("register", templateVars);
});

// create post request to handle new user registration - uses bcrypt to store user passwords as encrypted hashes instead of plain-text:
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Must fill out Email and Password fields");
  }
  const foundUser = findUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send("Email already registered");
  }
  const id = generateRandomString();
  const hash = bcrypt.hashSync(req.body.password, 10);
  const newUSer = {
    id: id,
    email: req.body.email,
    password: hash
  };
  users[id] = newUSer;
  req.session.id = id;
  res.redirect("/urls");
});

// Get request to show login page:
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.id] };
  res.render("login", templateVars);
});

// handles post request to login via /login - creates a user_id cookie - redirects to /urls:
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(403).send("Must fill out Email and Password fields");
  }
  const foundUser = findUserByEmail(email, users);
  if (!foundUser) {
    return res.status(403).send("Email not registered");
  }
  const correctPassword = bcrypt.compareSync(password, foundUser.password);
  if (correctPassword) {
    req.session.id = foundUser.id;
    res.redirect('/urls');
  } else {
    return res.send('Incorrect Password');
  }
});

// handles post request to logout - clears login info cookie - redirects to /urls:
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// handles post request to create new shortURL with generateRandomString function - redirects to /urls:
app.post("/urls", (req, res) => {
  const userID = req.session.id;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userID }; // Writing into the database
  res.redirect(`/urls/${shortURL}`);
});

// get request to show the EDIT page - editing the longURL for the current shortURL:
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[req.session.id]
  };
  res.render("urls_show", templateVars);
});

// get request to redirect to long URL using short url:
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// post request to edit existing short URL:
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body["editURL"];
  res.redirect('/urls');
});

// Post request to handle deleting urls from index - secured for users specific urls and have to be logged in:
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.id;
  const shortURL = req.params.shortURL;
  const urls = urlsForUser(userID, urlDatabase);
  const keys = Object.keys(urls);
  if (userID) {
    for (let key of keys) {
      if (shortURL === key) {
        delete urlDatabase[req.params.shortURL];
        return res.redirect("/urls");
      }
    }
    return res.status(401).send("Url not found in your database!\n");
  } else {
    return res.status(403).send("Please login or register!\n");
  }
});

// allows server to listen for requests:
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});