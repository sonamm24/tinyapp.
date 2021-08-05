const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

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

  
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls/:id", ...

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userid = req.cookies.user_id;
  const user = users[userid];
  const templateVars = { username: req.cookies ? req.cookies["username"] : "", urls: urlDatabase, user, userid };
  res.render("urls_index", templateVars);
});



app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const userid = req.cookies.user_id;
  const user = users[userid];
  const templateVars = { username: req.cookies ? req.cookies["username"] : "", user, userid};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
});

app.post("/register",(req,res) => {
  
  const userid = generateRandomString()
  
  console.log(req.body);
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password,10);
  console.log(email,password);
  if(email === "" || password === ""){
    res.status(400).send('Type here');
    
  }

  const isemailuser = emailexist(email);
  console.log(isemailuser);
  if (isemailuser){
    if (isemailuser.email === email){
      res.status(400).send('email exist');
    }
  }else{
    users [userid] = {
      id :  userid,
      email : email,
      password : password
    }
    console.log(users);
    res.cookie ('user_id' , userid) 
    console.log(email,password,userid);
    //res.cookie('register', req.body.register);
    res.redirect('/urls');

  }
 
  
 
});

app.post("/login",(req,res) => {
  const user = userexist(req.body.email, req.body.password)
 // const lookedupuser = emailexist()
  //res.cookie('username',req.body.username);
  if(user){
    res.cookie('user_id',user.id);
    res.redirect('/urls');
  }
  else {
    res.status(403).send('User not found');
    
  }
  
});

app.get("/login", (req,res) => {
  const userid = req.cookies.user_id;
  const user = users[userid];
  const templateVars = { username: req.cookies ? req.cookies["username"] : "", user,userid};
  res.render("urls_login", templateVars);
});

app.post("/logout",(req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post ("/urls/:shortURL/delete",(req,res) => {

     delete urlDatabase[req.params.shortURL]
     res.redirect('/urls')
});


app.get("/urls/:shortURL", (req, res) => {
  const userid = req.cookies.user_id;
  const user = users[userid];
  const templateVars = { username: req.cookies ? req.cookies["username"] : "", shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],user, userid};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  const userid = req.cookies.user_id;
  const user = users[userid];
  const templateVars = { username: req.cookies ? req.cookies["username"] : "", user,userid};
  res.render("urls_register", templateVars);
});

function generateRandomInteger(min,max) {
  return Math.floor(Math.random() * (max-min+1)) + min;
}

function generateRandomString() {
  let result = "";
  
  for(let i = 0; i<6 ; i++){
    let choice = generateRandomInteger(1,3);
    let randNum = 0;
    if(choice === 1) {
      randNum = generateRandomInteger(97,122);
    } else if (choice === 2) {
      randNum = generateRandomInteger(65,90);
    } else {
      randNum = generateRandomInteger(48,57);
    }

    let character = String.fromCharCode(randNum);
    result+=character;
  }
  console.log(result);
  return result;
}

function emailexist(inputemail) {
  let result = null;
  for (let i in users){
    let user  = users[i]// storing users index value into user
    let storedemail = users.email
    if (inputemail === storedemail){
      result = user;

    }

  }

  return result;
}

function userexist(inputemail,inputpassword){
  let result = null;
  for (let user in users){
    let currentuser  = users[user]// storing users index value into user
    let storedemail = currentuser.email
    console.log(currentuser);
    if (inputemail === storedemail){
      console.log(currentuser.password);
      if (bcrypt.compareSync(inputpassword, currentuser.password)){
        // returns true)
      //if (inputpassword === currentuser.password){
        return currentuser;
      }
    

    }

  }

  return result;
}



