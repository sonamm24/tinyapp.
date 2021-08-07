
const getUserByEmail = (email, database) => {
  let user = undefined;

  for (let i in database) {
    let storedemail = database[i].email;
    if (email === storedemail) {
      user = database[i];
    }
  }

  return user;
};

exports.getUserByEmail = getUserByEmail;