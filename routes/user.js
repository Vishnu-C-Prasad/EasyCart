var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const slideHelpers = require('../helpers/slide-helpers');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  productHelpers.getProduct().then((products) => {
    slideHelpers.getSlide().then((carouselItems) => {
      res.render('user/view-products', { title: 'EasyCart | Home', products, carouselItems, admin: false });
    });
  });

});

module.exports = router;
