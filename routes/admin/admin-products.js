var express = require('express');
var router = express.Router();
var fs = require('fs');
var productHelpers = require('../../helpers/product-helpers');

const state = {
  alertMessage: false
}

router.get('/all-products', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/admin-products', { title: 'AdminPanel | All Products', admin: true, adminDetails: req.session.admin, products, alertMessage: state.alertMessage });
    state.alertMessage = false;
  });
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { title: 'AdminPanel | Add Product', admin: true, adminDetails: req.session.admin });
});

router.post('/add-product', function (req, res) {
  productHelpers.addProduct(req.body, (id) => {
    state.alertMessage = `Added ${req.body.name}.`;
    let image = req.files.image;

    image.mv(`./public/images/product-images/${id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);

        res.render('admin/add-product', { title: 'AdminPanel | Add Product', admin: true, adminDetails: req.session.admin, alertMessage: state.alertMessage });
        state.alertMessage = false;
      }
    });

  });
});

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProduct(req.params.id);
  res.render('admin/edit-product', { title: 'AdminPanel | Edit Products', admin: true, adminDetails: req.session.admin, product })
});

router.post('/edit-product/:id', (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    state.alertMessage = `Updated ${req.body.name} details.`;
    res.redirect('/admin/all-products');

    if (req.files.image) {
      let image = req.files.image;

      image.mv(`./public/images/product-images/${req.params.id}.jpg`, (err, done) => {
        if (err) {
          console.log(err);
        } else {
          console.log(done);
        }
      });
    }
  });
});

router.get('/delete-product/:id', async (req, res) => {
  let product = await productHelpers.getProduct(req.params.id);
  productHelpers.deleteProduct(req.params.id).then(() => {
    fs.unlinkSync(`./public/images/product-images/${req.params.id}.jpg`);
    state.alertMessage = `Deleted ${product.name}.`;
    res.redirect('/admin/all-products');
  });
});

module.exports = router;
