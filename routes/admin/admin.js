var express = require('express');
const adminHelpers = require('../../helpers/adminHelpers');
var router = express.Router();
var productHelpers = require('../../helpers/product-helpers');
var slideHelpers = require('../../helpers/slide-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

router.get('/', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    slideHelpers.getAllSlides().then((carouselItems) => {
      adminHelpers.getAllOrders().then((orders) => {
        adminHelpers.getAllUsers().then((users) => {
          res.render('admin/admin-home', { title: 'AdminPanel | Home', admin: true, adminDetails: req.session.admin, carouselItems, products, orders, users });
        });
      });
    })
  });
});

router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin');
  } else {
    res.render('admin/login', { title: 'EasyCart | Admin Login', loginErr: req.session.adminLoginErr });
    req.session.adminLoginErr = false;
  }
});

router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect('/admin');
    } else {
      req.session.adminLoginErr = 'Invalid Username or Password';
      res.redirect('/admin/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect('/admin');
});

router.get('/all-orders', verifyLogin, (req, res) => {
  adminHelpers.getAllOrders().then((orders) => {
    res.render('admin/view-orders', { title: 'AdminPanel | Orders', filter: 'All', orders, admin: true, adminDetails: req.session.admin });
  });
});

router.get('/all-orders/:filterKey', verifyLogin, (req, res) => {
  adminHelpers.filterOrders(req.params.filterKey).then((orders) => {
    res.render('admin/view-orders', { title: 'AdminPanel | Orders', filter: req.params.filterKey, orders, admin: true, adminDetails: req.session.admin });
  });
});

router.get('/all-users', verifyLogin, (req, res) => {
  adminHelpers.getAllUsers().then((users) => {
    res.render('admin/view-users', { title: 'AdminPanel | Users', users, admin: true, adminDetails: req.session.admin });
  });
});

router.post('/ship-order', (req, res) => {
  adminHelpers.shipOrder(req.body).then((response) => {
    res.json({ status: true });
  });
});

router.post('/order-delivered', (req, res) => {
  adminHelpers.orderDelivered(req.body).then((response) => {
    res.json({ status: true });
  });
});

router.post('/cancel-order', (req, res) => {
  adminHelpers.cancelOrder(req.body).then((response) => {
    res.json({ status: true });
  });
});

router.post('/remove-order', (req, res) => {
  adminHelpers.removeOrder(req.body).then((response) => {
    res.json({ status: true });
  });
});

router.get('/view-order/:id', async (req, res) => {
  const order = await adminHelpers.getOrder(req.params.id);
  res.render('user/view-order', {  title: 'AdminPanel | View Order', order, admin: true, adminDetails: req.session.admin });
});

module.exports = router;
