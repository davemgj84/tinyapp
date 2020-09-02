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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Creating a user object to store user data:
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
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

// get request to handle /urls page - url index and cookies for user login info:
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// get request to handle new url input at /urls/new and cookies for user login info:
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

// create register get request:
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

// create post request to 
app.post("/register", (req, res) => {
  const id = generateRandomString();
   users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", id);
  res.redirect("/urls");
});

// handles post request to create new shortURL with generateRandomString function - redirects to /urls:
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// handles post request to login via /login - creates a username cookie related to login form - redirects to /urls:
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// handles post request to logout - clears login info cookie - redirects to /urls:
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.editURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// allows server to listen for requests:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ********** NOTES FOR EDUCATION PURPOSES FOR EJS SYNTAX**********
// <%= %>   **** variable insertion
// <% js %>    ***** js code on the page (ie: loops, if etc) - not visible*
// <%- include('/path') %>  ***** reusable pieces on each page 'included'