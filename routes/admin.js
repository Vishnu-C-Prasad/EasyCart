var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', function (req, res, next) {

  let products = [
    {
      name: 'Realme 6',
      category: 'Mobile',
      description: '64MP Pro Camera. Pro Display.',
      price: '14,999',
      image: 'https://image01.realme.net/general/20200302/1583145086637.jpg'
    },
    {
      name: 'Realme X50 Pro ',
      category: 'Mobile',
      description: 'Speed of the Future',
      price: '39,999',
      image: 'https://image01.realme.net/general/20200225/1582612881938.jpg'
    },
    {
      name: 'Realme X2 Pro',
      category: 'Mobile',
      description: 'Indias Fastest Charging Flagship',
      price: '29,999',
      image: 'https://image01.realme.net/general/20191112/1573530955589.jpg'
    },
    {
      name: 'Realme X3',
      category: 'Mobile',
      description: 'Super Zoom. Super Speed.',
      price: '24,999',
      image: 'https://image01.realme.net/general/20200610/1591795633564.jpg'
    }
  ];

  res.render('admin/admin-products', { title: 'AdminPanel | All Products', admin: true, products });
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { title: 'AdminPanel | Add Product', admin: true });
});

router.post('/add-product', function (req, res) {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;

    image.mv(`./public/images/product-images/${id}.jpg`, (err, done) => {
      if (err){
        console.log(err);
      } else {
        console.log(done);
        
        res.render('admin/add-product', { title: 'AdminPanel | Add Product', admin: true });
      }
    });

  });
});

module.exports = router;
