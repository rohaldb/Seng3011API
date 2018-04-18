var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  /* res.render('index', { title: 'Express' }); */
  res.redirect('https://seng4-a904d.firebaseapp.com/');
});

module.exports = router;
