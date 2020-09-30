var express = require('express');
var router = express.Router();
var fs = require('fs');
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

router.get('/update-product', function (req, res) {
  productHelpers.getProduct().then((products) => {
    res.render('admin/update-product', { title: 'AdminPanel | Update Product', admin: true, products });
  });
});

router.post('/update-product', function (req, res) {
  if (req.files) {
    fs.unlinkSync(`./public/images/product-images/${req.body._id}.jpg`);

    let image = req.files.image;

    image.mv(`./public/images/product-images/${req.body._id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);
      }
    });
  }

  productHelpers.updateProduct(req.body).then(() => {
    productHelpers.getProduct().then((products) => {
      res.render('admin/update-product', { title: 'AdminPanel | Update Product', admin: true, products });
    });
  });
});

router.get('/delete-product', function (req, res) {
  productHelpers.getProduct().then((products) => {
    res.render('admin/delete-product', { title: 'Adminpanel | Delete Product', admin: true, products });
  });
});

router.post('/delete-product', function (req, res) {
  fs.unlinkSync(`./public/images/product-images/${req.body._id}.jpg`);
  productHelpers.deleteProduct(req.body._id).then(() => {
    productHelpers.getProduct().then((products) => {
      res.render('admin/delete-product', { title: 'AdminPanel | Delete Product', admin: true, products });
    });
  });
});

module.exports = router;
