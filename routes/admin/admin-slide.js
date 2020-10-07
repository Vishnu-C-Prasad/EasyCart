var express = require('express');
var router = express.Router();
var fs = require('fs');
var slideHelpers = require('../../helpers/slide-helpers');

const state = {
  toastMessage: false
}

router.get('/all-slides', function (req, res) {
  slideHelpers.getAllSlides().then((carouselItems) => {
    res.render('admin/view-slides', { title: 'AdminPanel | All Slides', admin: true, carouselItems, toastMessage: state.toastMessage });
    state.toastMessage = false;
  });
});

router.get('/add-slide', function (req, res, next) {
  slideHelpers.getAllSlides().then((carouselItems) => {
    if (!carouselItems[0]) {
      res.render('admin/add-slide', { title: 'AdminPanel | Add Slide', admin: true, class: 'active' });
    } else {
      res.render('admin/add-slide', { title: 'AdminPanel | Add Slide', admin: true, class: '' });
    }
  })
});

router.post('/add-slide', function (req, res) {
  slideHelpers.addSlide(req.body, (id) => {
    state.toastMessage = `Added ${req.body.name}.`;
    let image = req.files.image;

    image.mv(`./public/images/slide-images/${id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);

        res.render('admin/add-slide', { title: 'AdminPanel | Add Slide', admin: true, toastMessage: state.toastMessage });
        state.toastMessage = false;
      }
    });
  });
});

router.get('/edit-slide/:id', async (req, res) => {
  let slide = await slideHelpers.getSlide(req.params.id);
  res.render('admin/edit-slide', { title: 'AdminPanel | Edit Slide', slide });
});

router.post('/edit-slide/:id', (req, res) => {
  slideHelpers.updateSlide(req.params.id, req.body).then(() => {
    state.toastMessage = `Updated ${req.body.name} details.`;
    res.redirect('/admin/all-slides');

    if (req.files.image) {
      let image = req.files.image;

      image.mv(`./public/images/slide-images/${req.params.id}.jpg`, (err, done) => {
        if (err) {
          console.log(err);
        } else {
          console.log(done);
        }
      });
    }
  });
});

router.get('/delete-slide/:id', async (req, res) => {
  let slide = await slideHelpers.getSlide(req.params.id);
  slideHelpers.deleteSlide(req.params.id).then(() => {
    fs.unlinkSync(`./public/images/slide-images/${req.params.id}.jpg`);
    state.toastMessage = `Deleted ${slide.name}.`;
    res.redirect('/admin/all-slides');
  });
});

module.exports = router;
