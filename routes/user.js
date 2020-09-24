var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  let products = [
    {
      name: 'Realme 6',
      description: '(Comet Blue, 64 GB) (6 GB RAM) · 6 GB RAM | 64 GB ROM | Expandable Upto 256 GB · 16.51 cm (6.5 inch) Full HD+ Display · 64MP + 8MP + 2MP + 2MP Camera',
      price: 14999,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTTsmS-gVvfB7fLTUQNZHEIuDITTzDGU2Dx7A&usqp=CAU'
    },
    {
      name: 'Redmi Note 9 Pro',
      description: 'Interstellar Black, 6GB RAM, 128GB Storage, 48MP Quad Camera & Full HD+ Display. - Latest 8nm Snapdragon 720G & Gorilla Glass 5 Protection',
      price: 16999,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQI0PyQ5_bGyWHVJ-9FmmBXTF1hlAhd2n9i3A&usqp=CAU'
    },
    {
      name: 'OnePlus Nord',
      description: 'The same Fast and Smooth experience that uniquely OnePlus. Flagship camera, Nightscape, Dual selfie cameras, OxygenOS, 90 Hz AMOLED display',
      price: 27999,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQyPaylve3bWPLQWvbV7PVIGWaAoyBimxuPMg&usqp=CAU'
    },
    {
      name: 'OnePlus 8 Pro',
      description: 'With over 280 software optimizations, the OnePlus 8 Pro runs seamlessly at 120 Hz, so swiping and scrolling feels smooth and effortless',
      price: 54999,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQERFtfECmu4c0EAzHqwtwHSvWGh72qougu4A&usqp=CAU'
    }
  ];

  res.render('index', { products, admin:false });
});

module.exports = router;
