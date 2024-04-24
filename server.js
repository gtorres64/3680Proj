if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const http = require('http');
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override')

const hostname = '127.0.0.1';
const port = 3050;

const initializePassport =  require('./passport-config');
initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req, res) => {
    console.log("Request recieved");
    res.render('index.ejs', {name: req.user.name});
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/aah',
    failureRedirect: '/aah/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/aah/login');
    } catch {
        res.redirect('/aah/register')
    }
    console.log(users);
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/aah/login');
    });
  });

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/aah/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/aah');
    }
    next();
}

app.listen(port, hostname);

//const server = http.createServer((req, res) => {
//    console.log("Request Received");
//    res.statusCode = 200;
//    res.setHeader('Content-Type', 'text/plain');
//    res.end("HELLO WORLD\n");
//});
//
//app.listen(port, hostname, () => {
//console.log(`Server running at http://${hostname}:${port}/`);
//});