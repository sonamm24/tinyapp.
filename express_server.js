const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls/:id", ...

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);

});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] 

   };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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
