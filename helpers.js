const bcrypt = require('bcrypt');

function getUserByEmail(email, database) {
  let user = undefined;

  for (let i in database) {
    let storedemail = database[i].email;
    if (email === storedemail) {
      user = database[i];
    }
  }

  return user;
};

const urlsForUser = function(id, database) {
  let filteredURLS = {};

  for (let i in database) {
    if (database[i].userID === id) {
      filteredURLS[i] = database[i].longURL;
    }
  }

  return filteredURLS;
};

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
  return result;
};

const userexist = function(inputemail,inputpassword, database) {
  let result = null;
  for (let user in database) {
    let currentuser = database[user];// storing users index value into user
    let storedemail = currentuser.email;

    if (inputemail === storedemail && bcrypt.compareSync(inputpassword, currentuser.password)) {
      return currentuser;
    }
  }

  return result;
};

module.exports = {getUserByEmail, urlsForUser, generateRandomString, userexist};