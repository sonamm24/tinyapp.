const { getUserByEmail, urlsForUser, generateRandomString, userexist } = require("./helpers.js");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//////SETTING UP DATABASES///////

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

/////HELPER FUNCTIONS///////



///////APP PREP///////
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));

///////APP GET ROUTES/////

app.get("/", (req, res) => {
  //res.send("Hello!");
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];

  if (user) {
    const templateVars = { urls: urlsForUser(userid, users), user, userid };
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

app.get("/urls/:shortURL", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (user) {
    const urlsList = urlsForUser(userid, users);
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

///////APP POST ROUTES/////

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
  if(req.body.email === "" && req.body.password === ""){
    res.status(403).send('Missing both email and password!');
  }

  if(req.body.email === ""){
    res.status(403).send('Missing email');
  }

  if(req.body.password === ""){
    res.status(403).send('Missing password');
  }

  const user = userexist(req.body.email, req.body.password, users);

  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  } else {
    if(getUserByEmail(req.body.email, users)){
      res.status(403).send('Wrong Password');
    } else {
      res.status(403).send('Email not found');
    }
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
    const urlsList = urlsForUser(userid, users);
    if (urlsList[req.params.shortURL]) {
      delete urlDatabase[req.params.shortURL];
    }

    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

///////APP PORT LISTENING FUNCTIONS////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});