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

///////APP PREP///////
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));

///////APP GET ROUTES/////

app.get("/", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];

  if(user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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

app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];

  if (user) {
    const templateVars = { urls: urlsForUser(userid, urlDatabase), user };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { message: "not logged in! ", user : null};
   
    res.status(401).render("urls_error", templateVars);
  }
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

app.get("/urls/:id", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (user) {
    if(urlDatabase[req.params.id]){
      const urlsList = urlsForUser(userid, urlDatabase);
      if (urlsList[req.params.id]) {
        const shortURL = req.params.id;
        const templateVars = {
          username: req.session ? req.session["username"] : "",
          shortURL: shortURL,
          longURL: urlDatabase[shortURL].longURL,
          user,
          userid
        };
        res.render("urls_show", templateVars);
      } else {
        const templateVars = { message: "Not authorized to access this URL!", user : null};
    
        res.status(403).render("urls_error", templateVars);
      }
    } else {
      const templateVars = { message: "URL does not exist!", user : null};
     
      res.status(404).render("urls_error", templateVars);
    }
  } else {
    const templateVars = { message: "not logged in!", user : null};
   
    res.status(401).render("urls_error", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    const templateVars = { message: "Short URL does not exist!", user : null};
    
    res.status(404).render("urls_error", templateVars);
  }
});

app.get("/login", (req,res) => {
  const userid = req.session.user_id;
  const user = users[userid];

  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { username: req.session ? req.session["username"] : "", user,userid};
    res.render("urls_login", templateVars);
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
    const templateVars = { message: "not logged in! ", user : null};
    
    res.status(401).render("urls_error", templateVars);
  }
});

app.post("/urls/:id",(req,res) => {
  const userid = req.session.user_id;
  const user = users[userid];

  if(user){
    const urlsList = urlsForUser(userid, urlDatabase);
    if(urlsList[req.params.id]){
      //console.log(urlDatabase[req.params.id]);
      urlDatabase[req.params.id].longURL = req.body.longURL;
      res.redirect("/urls/" + req.params.id)
    } else {
      const templateVars = { message: "Not authorized to access this URL!", user : null};
      
      res.status(403).render("urls_error", templateVars);
    }
  } else {
    const templateVars = { message: "not logged in! ", user : null};
    
    res.status(401).render("urls_error", templateVars);
  }
});

app.post("/urls/:id/delete",(req,res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (user) {
    const urlsList = urlsForUser(userid, urlDatabase);
    if (urlsList[req.params.id]) {
      delete urlDatabase[req.params.id];
      res.redirect('/urls');
    } else {
      const templateVars = { message: "Not authorized to access this URL!", user : null};
      
      res.status(403).render("urls_error", templateVars);
    }
  } else {
    const templateVars = { message: "not logged in! ", user : null};
    
    res.status(401).render("urls_error", templateVars);
  }
});

app.post("/login",(req,res) => {
  if(req.body.email === "" && req.body.password === ""){
    const templateVars = { message: "Missing both email and password!", user : null};
    
    res.status(400).render("urls_error", templateVars);
    return;
  }

  if(req.body.email === ""){
    const templateVars = { message: "Missing email", user : null};
    
    res.status(400).render("urls_error", templateVars);
    return;
  }

  if(req.body.password === ""){
    const templateVars = { message: "Missing password", user : null};
   
    res.status(400).render("urls_error", templateVars);
    return;
  }

  const user = userexist(req.body.email, req.body.password, users);

  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  } else {
    if(getUserByEmail(req.body.email, users)){
      const templateVars = { message: "Wrong Password", user : null};
      res.status(403);
      res.render("urls_error", templateVars);
    } else {
      const templateVars = { message: "Email not found", user : null};
      
      res.status(403).render("urls_error", templateVars);
    }
  }
});

app.post("/register",(req,res) => {
  
  const userid = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if(email === "" && password === "") {
    const templateVars = { message: "Missing both email and password!", user : null};
    
    res.status(400).render("urls_error", templateVars);
    return;
  }

  if (email === ""){
    const templateVars = { message: "Missing email", user : null};
    
    res.status(400).render("urls_error", templateVars);
    return;
  }
  
  if( password === "") {
    const templateVars = { message: "Missing password", user : null};
    
    res.status(400).render("urls_error", templateVars);
    return;
  }

  const isemailuser = getUserByEmail(email, users);

  if (isemailuser) {
    if (isemailuser.email === email) {
      const templateVars = { message: "Email already exists", user : null};
      
      res.status(400).render("urls_error", templateVars);
    }
  } else {
    users [userid] = {
      id :  userid,
      email : email,
      password : bcrypt.hashSync(password,10)
    };

    req.session.user_id = userid;
    res.redirect('/urls');
  }
});

app.post("/logout",(req,res) => {
  req.session['user_id'] = null;
  res.redirect('/urls');
});

///////APP PORT LISTENING FUNCTIONS////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});