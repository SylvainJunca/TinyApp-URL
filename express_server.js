const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['purple-monkey-dinosaur'],
  maxAge: 15 * 60 * 1000 // 15 minutes
}))

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
  },
 "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: "yopolo-tamasa"
  },
 "user4RandomID": {
    id: "user4RandomID", 
    email: "user4@example.com", 
    password: "arguments-umbrella"
  },
 "user5RandomID": {
    id: "user5RandomID", 
    email: "user5@example.com", 
    password: "cat-watersalmon"
  }
};

const urlDatabase = {
  "b2xVn2": { "url": "http://www.lighthouselabs.ca",
  "user_ID": "user5RandomID" },
  "9sm5xK": { "url": "http://www.google.com",
  "user_ID": "userRandomID" },
  "t7UrE4": { "url": "http://www.macg.co",
  "user_ID": "user2RandomID" },
  "b2xfTu": { "url": "http://www.lifeisabeach.fr",
  "user_ID": "user5RandomID" },
};

function generateRandomString() {
  const key = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let short = '';
  for(let i = 0; i < 6; i++) {
    short += key[Math.floor(Math.random() * key.length)];
  }
  if (urlDatabase.hasOwnProperty(short)) {
   generateRandomString();
  }
  return short;
}


//Created those functions to be able to call them at different points of my code
//and make it easier to update them if we need.

const isLogged = (req) => req.session.user_id ;
const isOwner = (req) => {
  return (req.session.user_id === urlDatabase[req.params.id]['user_ID'])
};

//This function allows to gather all the urls owned by one specific user
const urlsForUser = (id) => {
  const userURL = {}
  for (each in urlDatabase) {
    if (urlDatabase[each]['user_ID'] === id){
      userURL[each] = urlDatabase[each];
    };
  };
  return userURL;
}

// Tut tut - Here start the beautiful routes of our server

app.get('/', (req, res) => {
  if (isLogged(req)){
    res.redirect('urls');
  } else {
    res.redirect('login');
  }
});

app.get('/urls', (req, res) => {
  
  if (isLogged(req)){
    let templateVars = { urls: urlsForUser(req.session.user_id), 
      user: users[req.session.user_id]};
    res.render('urls_index', templateVars);
  } else {
  res.send(`You should <a href='/login'>login</a> or <a href='/register'>register</a>`);
  };
});

app.get('/urls/new', (req, res) => {
  if (isLogged(req)) {
    let templateVars = { user: users[req.session.user_id] }
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }  
});

app.get('/urls/:id', (req, res) => {
  let statusFlag = 0;
  
  if (isLogged(req)) {
    statusFlag = 2;
  } if(isLogged(req) && isOwner(req)){
    statusFlag = 1;
  }

  switch (statusFlag){
    case 1:
      let templateVars = { shortURL: req.params.id,
        url: urlDatabase[req.params.id]['url'],
        user: users[req.session.user_id] };
      res.render("urls_show", templateVars);
      break;
    case 2:
      res.send('You cannot have access to this page');
      break;
    default:
      res.send(`You should <a href='/login'>login</a> or <a href='/register'>register</a>`);
  }
});

app.get('/u/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id]['url'];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  if (isLogged(req)){
    const shortURL = generateRandomString()
    urlDatabase[shortURL] = {
      'url': req.body['longURL'],
      'user_ID': req.session.user_id
    };
    res.redirect(`http://localhost:8080/urls/${shortURL}`);
  } else {
    res.send('You should login in order to shorten the UR?L of your choice');
  }
});

app.post('/urls/:id', (req, res) => {
  if(isOwner(req)){
    urlDatabase[req.params.id]['url'] = req.body[req.params.id];
    res.redirect('/urls');
  };
});

app.post("/urls/:id/delete", (req, res) =>  {
  if (isOwner(req)){
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
  };
});

app.get('/login', (req, res) => {
  if (isLogged(req)) {
    res.redirect('/urls')
  }
  let templateVars = { user: users[req.session.user_id] }
  res.render('login', templateVars);
});

app.get("/register", (req, res) => {
  if (isLogged(req)) {
    res.redirect('/urls')
  }
  let templateVars = { user: users[req.session.user_id] }
  res.render("register", templateVars);
});


//We check if the user enters the correct email and password to login
//Depending on the value of the flag we will let the user login or not 
//Flag 1 correct user name and password 
//Flag 0 password incorrect
//Flag 2 email incorrect

app.post('/login', (req, res) => {

  //Creates the flag
    let securityFlag = 2;
    for(const each in users){
      if (users[each]['email'] === req.body.email) {
        securityFlag = 0;
      } if (users[each]['email'] === req.body.email && bcrypt.compareSync(req.body.password, users[each]['password'])) {
        req.session.user_id = users[each]['id'];
        securityFlag = 1;
      } ; 
    };
  
  //Checks the flag
  switch(securityFlag) {
    case 0: 
      res.status(403);
      res.send('None shall pass without the correct information!');
      break;
    case 1: 
      res.redirect('/');
      break;
    default:  
    res.status(403);
    res.send('None shall pass without entering the correct email and password');
  }
});

//We check if the user enters the correct email and password to login
//Depending on the value of the flag we will let the user login or not 
//Flag 1 correct user name and password 
//Flag 0 password incorrect
//Flag 2 email incorrect

app.post('/register', (req, res) => {
  let notExistingEmail = 1;
  if (req.body.email && req.body.password) {
    for (const each in users) {
      if (users[each]['email'] === req.body.email) {
        notExistingEmail = 0;
      };
    };
    if (notExistingEmail) {
      const usrName = generateRandomString();
      req.session.user_id = usrName;
      const hashedPassword = bcrypt.hashSync(req.body.password, 10); // Hash the password entered
      users[usrName] = {
        id: usrName,
        email: req.body.email,
        password: hashedPassword
      };
    res.redirect('/urls');
    } else {
      res.status(400);
      res.send('Hey, this email is already registered in our database!');
    }
  } else {
  res.status(400);
  res.send('None shall pass without entering all the mandatory information');
  };
});

app.get('/logout', (req, res) => {
  delete req.session.user_id;
  res.redirect('urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

