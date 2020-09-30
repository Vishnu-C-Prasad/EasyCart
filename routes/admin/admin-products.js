var express = require('express');
var router = express.Router();
var productHelpers = require('../../helpers/product-helpers');

router.get('/all-products', function (req, res, next) {
  productHelpers.getProduct().then((products) => {
    res.render('admin/admin-products', { title: 'AdminPanel | All Products', admin: true, products });
  });
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { title: 'AdminPanel | Add Product', admin: true });
});

router.post('/add-product', function (req, res) {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;

    image.mv(`./public/images/product-images/${id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);

        res.render('admin/add-product', { title: 'AdminPanel | Add Product', admin: true });
      }
    });

  });
});

module.exports = router;
