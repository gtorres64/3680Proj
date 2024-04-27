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
const port = 3000;

const initializePassport =  require('./passport-config');
const {pool, insertUser} = require('./sql/mysql-config');
initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []
const ROLES = {
    ADMIN: 'admin',
    CUSTOMER: 'customer'
};

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

app.get('/', (req, res) => {
    console.log("Request recieved");
    res.render('index.ejs');
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    console.log("Logged in");
    if (req.user.role === 'admin') {
        res.redirect('/admin_dashboard');
    } else if (req.user.role === 'customer') {
        res.redirect('/customer_dashboard');
    } else {
        res.redirect('/');
    }
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
})

app.get('/admin_dashboard', checkAdmin, (req, res) => {
    res.render('dashAdmin.ejs');
})

app.get('/customer_dashboard', checkCustomer, (req, res) => {
    res.render('dashCustomer.ejs', {name: req.user.name});
})


app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        //Register the user to the database

        const userId = await insertUser(
            req.body.username, 
            hashedPassword, 
            req.body.email, 
            req.body.firstName, 
            req.body.lastName);
        console.log("USER INSERTED WITH ID:", userId);
        res.redirect('/login');

    } catch (error){
        console.error('ERROR REGISTERING USER:', error);
        res.redirect('/register');
    }
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
  });

function checkCustomer(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function checkAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
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