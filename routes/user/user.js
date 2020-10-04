var express = require('express');
var productHelpers = require('../../helpers/product-helpers');
var slideHelpers = require('../../helpers/slide-helpers');
var userHelpers = require('../../helpers/user-helpers');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;

  productHelpers.getProduct().then((products) => {
    slideHelpers.getSlide().then((carouselItems) => {
      res.render('user/view-products', { title: 'EasyCart | Home', products, carouselItems, user });
    });
  });
});

router.get('/login', (req, res) => {
  res.render('user/login');
});

router.get('/signup', (req, res) => {
  res.render('user/signup')
});

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect('/');
  });
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
