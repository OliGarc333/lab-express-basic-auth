const express = require('express');
const router = new express.Router();
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');
const app = require('./../app');

// Fetches landing page

router.get('/', (req, res, next) => {
  req.session.id = 'asdfdasfasfd';
  console.log(req.session);
  res.render('index');
});

// Fetches registration requests

router.get('/register', (req, res, next) => {
  res.render('register');
});

// Fetches login requests

router.get('/login', (req, res, next) => {
  res.render('login');
});

// Handles register form

router.post('/register', (req, res, next) => {
  const { username, password } = req.body;

  if (username === '' || password === '') {
    throw new Error(
      `There's been an error. Please review the provided information`
    );
  }
  bcryptjs
    .hash(password, 10)
    .then((passwordHashAndSalt) => {
      return User.create({
        username,
        passwordHashAndSalt
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      res.redirect('/profile');
    })
    .catch((error) => {
      next(error);
    });
});

// Handles login form

router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  let user;
  User.findOne({ username })
    .then((doc) => {
      user = doc;
      if (user === null) {
        throw new Error('There are no users with this name');
      } else {
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((comparisonResult) => {
      if (comparisonResult) {
        req.session.userId = user._id;
        res.redirect('/profile');
      } else {
        throw new Error('Wrong password');
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/profile', (req, res, next) => {
  if (req.session.userId) {
    res.render('profile', { user: req.user });
  } else {
    next(
      new Error('You are not authorized to acess this page. Please sign in!')
    );
  }
});

// Handles requests made to main
router.get('/main', (req, res, next) => {
  if (req.session.userId) {
    res.render('main', { user: req.user });
  } else {
    next(
      new Error('You are not authorized to acess this page. Please sign in!')
    );
  }
});

// Handles requests made to private
router.get('/private', (req, res, next) => {
  if (req.session.userId) {
    res.render('private', { user: req.user });
  } else {
    next(
      new Error('You are not authorized to acess this page. Please sign in!')
    );
  }
});

// Terminates session
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
