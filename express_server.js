const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

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


// URL Database Object that stores our key value pairs (short URL and Long URL):
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

// Creating a user object to store user data:
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "1@mail.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Function to help separate urls based on userID.
const urlsForUser = (id) => {
  const userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url].longURL;
    }
  }
  return userUrls;
};

// function to find user by email:
const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// initial server setup tests:
app.get("/", (req, res) => {
  res.send("Hello!");
});

// initial server setup tests:
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// initial server setup tests:
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// get request to show collection of urls:
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = {
    urls: urlsForUser(userID),
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

// get request to show new url input at /urls/new and cookies for user login info:
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

// get request to show register page:
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

// create post request to handle new user registration:
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Must fill out Email and Password fields");
  }
  const foundUser = findUserByEmail(email);
  if (foundUser) {
    return res.status(400).send("Email already registered");
  }
  const id = generateRandomString();
  const newUSer = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  users[id] = newUSer;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// handles post request to create new shortURL with generateRandomString function - redirects to /urls:
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userID }; // Writing into the database
  res.redirect(`/urls/${shortURL}`);
});

// Get request to show login page:
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

// handles post request to login via /login - creates a user_id cookie - redirects to /urls:
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(403).send("Must fill out Email and Password fields");
  }
  const foundUser = findUserByEmail(email);
  if (foundUser === null) {
    return res.status(403).send("Email not registered");
  }
  if (foundUser.password !== password) {
    return res.send('Incorrect Password');
  }
  res.cookie('user_id', foundUser.id);
  res.redirect('/urls');
});

// handles post request to logout - clears login info cookie - redirects to /urls:
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// get request to show the EDIT page - editing the longURL for the current shortURL:
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[req.cookies["user_id"]]
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

// Post request to handle deleting urls from index:
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// allows server to listen for requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});