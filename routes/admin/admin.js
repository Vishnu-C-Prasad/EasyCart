var express = require('express');
var router = express.Router();
var productHelpers = require('../../helpers/product-helpers');
var slideHelpers = require('../../helpers/slide-helpers');

router.get('/', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    slideHelpers.getAllSlides().then((carouselItems) => {
      const product = products[0];
      res.render('admin/admin-home', { title: 'AdminPanel | Home', admin: true, carouselItems, product });
    })
  });
});

module.exports = router;
