var express = require('express');
var router = express.Router();
var fs = require('fs');
var slideHelpers = require('../../helpers/slide-helpers');

router.get('/all-slides', function (req, res) {
  slideHelpers.getSlide().then((carouselItems) => {
    res.render('admin/view-slides', { title: 'AdminPanel | All Slides', admin: true, carouselItems });
  });
});

router.get('/update-slide', function (req, res, next) {
  slideHelpers.getSlide().then((carouselItems) => {
    res.render('admin/update-slide', { title: 'AdminPanel | Update Slide', admin: true, carouselItems });
  })
});

router.post('/update-slide', function (req, res) {
  if (req.files) {
    fs.unlinkSync(`./public/images/slide-images/${req.body._id}.jpg`);

    let image = req.files.image;

    image.mv(`./public/images/slide-images/${req.body._id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);
      }
    });
  }

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

module.exports = router;
