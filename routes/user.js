var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  let carouselItems = [
    {
      class: 'active',
      image: 'https://image01.realme.net/general/20200923/1600857864731.jpg',
      name: 'Realme Narzo 20A',
      description: 'The Rush of Performance',
      price: '8,499'
    },
    {
      image: 'https://image01.realme.net/general/20200923/1600859455584.jpg',
      name: 'Realme Narzo 20 PRO',
      description: 'The Speed of Dart',
      price: '14,999'
    },
    {
      image: 'https://image01.realme.net/general/20200923/1600859632742.jpg',
      name: 'Realme Narzo 20',
      description: 'The Surge of Power',
      price: '10,499'
    },
  ];

  let products = [
    {
      name: 'Realme 6',
      description: '64MP Pro Camera. Pro Display.',
      price: '14,999',
      image: 'https://image01.realme.net/general/20200302/1583145086637.jpg'
    },
    {
      name: 'Realme X50 Pro ',
      description: 'Speed of the Future',
      price: '39,999',
      image: 'https://image01.realme.net/general/20200225/1582612881938.jpg'
    },
    {
      name: 'Realme X2 Pro',
      description: 'Indias Fastest Charging Flagship',
      price: '29,999',
      image: 'https://image01.realme.net/general/20191112/1573530955589.jpg'
    },
    {
      name: 'Realme X3',
      description: 'Super Zoom. Super Speed.',
      price: '24,999',
      image: 'https://image01.realme.net/general/20200610/1591795633564.jpg'
    }
  ];

  res.render('index', { title: 'EasyCart | Home', products, carouselItems, admin:false });
});

module.exports = router;
