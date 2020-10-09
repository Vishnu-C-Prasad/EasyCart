var express = require('express');
var productHelpers = require('../../helpers/product-helpers');
var slideHelpers = require('../../helpers/slide-helpers');
var userHelpers = require('../../helpers/user-helpers');
var router = express.Router();

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getAllProducts().then((products) => {
    slideHelpers.getAllSlides().then((carouselItems) => {
      res.render('user/view-products', { title: 'EasyCart | Home', products, carouselItems, user: req.session.user, cartCount });
    });
  });
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('user/login', { title: 'EasyCart | Login', loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('user/signup', { title: 'EasyCart | Signup' })
  }
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
      req.session.loginErr = 'Invalid Username or Password';
      res.redirect('/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/cart', verifyLogin, async (req, res) => {
  const cartCount = await userHelpers.getCartCount(req.session.user._id);
  const cartItems = await userHelpers.getCartItems(req.session.user._id);

  let totalPrice = 0;
  cartItems.forEach(item => {
    totalPrice += parseInt(item.price);
  });

  res.render('user/cart', { title: 'EasyCart | Cart', user: req.session.user, cartItems, cartCount, totalPrice });
});

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.redirect('/cart');
  });
});

router.get('/my-profile/', verifyLogin, async (req, res) => {
  const cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render('user/view-profile', { user: req.session.user, cartCount });
});

module.exports = router;
