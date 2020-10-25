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
      res.render('user/view-products', { title: 'EasyCart | Home', products, carouselItems, user: req.session.user, loggedIn: req.session.loggedIn, cartCount });
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
  const totalAmount = await userHelpers.getTotalAmount(req.session.user._id);

  res.render('user/cart', { title: 'EasyCart | Cart', user: req.session.user, cartItems, cartCount, totalAmount });
});

router.get('/add-to-cart/:id', (req, res) => {
  if (req.session.user) {
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  } else {
    res.json({ status: false });
  }
});

router.post('/change-product-quantity', (req, res) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    const totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
    response.totalAmount = totalAmount;
    res.json(response);
  });
});

router.post('/remove-from-cart', (req, res, next) => {
  userHelpers.removeFromCart(req.body).then((response) => {
    res.json(response);
  });
});

router.get('/my-profile/', verifyLogin, async (req, res) => {
  const cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render('user/view-profile', { user: req.session.user, cartCount });
});

router.post('/add-new-address', (req, res) => {
  userHelpers.addNewAddress(req.session.user._id, req.body).then((response) => {
    req.session.user = response;
    res.json(req.body);
  });
});

router.get('/place-order', verifyLogin, async (req, res) => {
  const totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
  const cartItems = await userHelpers.getCartItems(req.session.user._id);
  res.render('user/place-order', { user: req.session.user, totalAmount, cartItems });
});

router.post('/place-order', async (req, res) => {
  const address = await userHelpers.getAddress(req.session.user._id, req.body.addressId);
  const products = await userHelpers.getCartItemsList(req.session.user._id);
  const totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
  userHelpers.placeOrder(req.session.user._id, address, req.body.paymentMethod, products, totalAmount).then((orderId) => {
    if (req.body.paymentMethod === 'COD') {
      res.json({ codSuccess: true, _id: orderId });
    } else if (req.body.paymentMethod === 'onlinepayment') {
      userHelpers.generateRazorpay(orderId, totalAmount).then((response) => {
        res.json(response);
      });
    }
  });
});

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changeOrderStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true });
    });
  }).catch((err) => {
    res.json({ status: false, errMessage: 'Payment falied' });
  });
});

router.get('/order-success/:id', verifyLogin, async (req, res) => {
  const order = await userHelpers.getOrder(req.params.id);
  res.render('user/order-success', { order, user: req.session.user });
});

router.get('/my-orders', verifyLogin, async (req, res) => {
  const orders = await userHelpers.getAllOrders(req.session.user._id);
  res.render('user/my-orders', { orders, user: req.session.user });
});

router.get('/view-order/:id', async (req, res) => {
  const order = await userHelpers.getOrder(req.params.id);
  res.render('user/view-order', { order, user: req.session.user });
});

router.post('/edit-personal-info', (req, res) => {
  userHelpers.editPersonalInfo(req.body, req.session.user._id).then((user) => {
    req.session.user = user;
    res.json({status: true});
  });
});

module.exports = router;
