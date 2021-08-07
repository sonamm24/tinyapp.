const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",10)
  }
};

let urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const bodyParser = require("body-parser");
const getUserByEmail = require("./helpers");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const urlsForUser = function(id) {
  let filteredURLS = {};

  for (let i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      filteredURLS[i] = urlDatabase[i].longURL;
    }
  }

  return filteredURLS;
};

app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];

  if (user) {
    const templateVars = { urls: urlsForUser(userid), user, userid };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  
  const userid = req.session.user_id;
  const user = users[userid];
  
  if (user) {
    const templateVars = { username: req.session ? req.session["username"] : "", user, userid};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.post("/urls", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];

  if (user) {
    let shortURL = generateRandomString();
    
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userid
    };

    res.redirect("/urls/" + shortURL);
  } else {
    res.send("Error not logged in!");
  }
});

app.post("/register",(req,res) => {
  
  const userid = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password,10);

  if (email === "" || password === "") {
    res.status(400).send('Type here');
  }

  const isemailuser = getUserByEmail(email, users);

  if (isemailuser) {
    if (isemailuser.email === email) {
      res.status(400).send('email exist');
    }
  } else {
    users [userid] = {
      id :  userid,
      email : email,
      password : password
    };

    req.session.user_id = userid;
    res.redirect('/urls');
  }
});

app.post("/login",(req,res) => {

  const user = userexist(req.body.email, req.body.password);

  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send('User not found');
  }
});

app.get("/login", (req,res) => {
  const userid = req.session.user_id;

  const user = users[userid];
  console.log('user: ', user);
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { username: req.session ? req.session["username"] : "", user,userid};
    res.render("urls_login", templateVars);
  }
 
});

app.post("/logout",(req,res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete",(req,res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (user) {
    const urlsList = urlsForUser(userid);
    if (urlsList[req.params.shortURL]) {
      delete urlDatabase[req.params.shortURL];
    }

    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (user) {
    const urlsList = urlsForUser(userid);
    if (urlsList[req.params.shortURL]) {
      const shortURL = req.params.shortURL;
      const templateVars = {
        username: req.session ? req.session["username"] : "",
        shortURL: shortURL,
        longURL: urlDatabase[shortURL].longURL,
        user,
        userid
      };
      res.render("urls_show", templateVars);
    } else {
      res.redirect("/urls");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send('Long URL not found!');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { username: req.session ? req.session["username"] : "", user,userid};
    res.render("urls_register", templateVars);
  }
 
});

const generateRandomInteger = function(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomString = function() {
  let result = "";
  
  for (let i = 0; i < 6; i++) {
    let choice = generateRandomInteger(1,3);
    let randNum = 0;
    if (choice === 1) {
      randNum = generateRandomInteger(97,122);
    } else if (choice === 2) {
      randNum = generateRandomInteger(65,90);
    } else {
      randNum = generateRandomInteger(48,57);
    }

    let character = String.fromCharCode(randNum);
    result += character;
  }
  console.log(result);
  return result;
};

const userexist = function(inputemail,inputpassword) {
  let result = null;
  for (let user in users) {
    let currentuser = users[user];// storing users index value into user
    let storedemail = currentuser.email;

    if (inputemail === storedemail && bcrypt.compareSync(inputpassword, currentuser.password)) {
      return currentuser;
    }
  }

  return result;
};
