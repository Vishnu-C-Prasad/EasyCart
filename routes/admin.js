var express = require('express');
var router = express.Router();
var fs = require('fs');
var productHelpers = require('../helpers/product-helpers');
var slideHelpers = require('../helpers/slide-helpers');

router.get('/', function (req, res, next) {
  productHelpers.getProduct().then((products) => {
    slideHelpers.getSlide().then((carouselItems) => {
      const product = products[0];
      res.render('admin/admin-home', { title: 'AdminPanel | Home', admin: true, carouselItems, product });
    })
  });
});

router.get('/all-slides', function(req, res) {
  slideHelpers.getSlide().then((carouselItems) => {
    res.render('admin/view-slides', { title: 'AdminPanel | All Slides', admin: true, carouselItems});
  });
});

router.get('/update-slide', function (req, res, next) {
  slideHelpers.getSlide().then((carouselItems) => {
    res.render('admin/update-slide', { title: 'AdminPanel | Update Slide', admin: true, carouselItems });
  })
});

router.post('/update-slide', function (req, res) {
  fs.unlinkSync(`./public/images/slide-images/${req.body._id}.jpg`);
  let image = req.files.image;

  image.mv(`./public/images/slide-images/${req.body._id}.jpg`, (err, done) => {
    if (err) {
      console.log(err);
    } else {
      console.log(done);
    }
  });

  slideHelpers.updateSlide(req.body).then(() => {
    slideHelpers.getSlide().then((carouselItems) => {
      res.render('admin/update-slide', { title: 'AdminPanel | Update Slide', admin: true, carouselItems });
    });
  });
});

router.get('/add-slide', function (req, res, next) {
  slideHelpers.getSlide().then((carouselItems) => {
    if (!carouselItems[0]) {
      res.render('admin/add-slide', { title: 'AdminPanel | Add Slide', admin: true, class: 'active' });
    } else {
      res.render('admin/add-slide', { title: 'AdminPanel | Add Slide', admin: true, class: '' });
    }
  })
});

router.post('/add-slide', function (req, res) {
  slideHelpers.addSlide(req.body, (id) => {
    let image = req.files.image;

    image.mv(`./public/images/slide-images/${id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);

        res.render('admin/add-slide', { title: 'AdminPanel | Add Slide', admin: true });
      }
    });
  });
});

router.get('/delete-slide', function (req, res, next) {
  slideHelpers.getSlide().then((carouselItems) => {
    res.render('admin/delete-slide', { title: 'AdminPanel | Delete Slide', admin: true, carouselItems });
  });
});

router.post('/delete-slide', function (req, res) {
  fs.unlinkSync(`./public/images/slide-images/${req.body._id}.jpg`);
  slideHelpers.deleteSlide(req.body._id).then(() => {
    slideHelpers.getSlide().then((carouselItems) => {
      res.render('admin/delete-slide', { title: 'AdminPanel | Delete Slide', admin: true, carouselItems });
    });
  });
});

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
