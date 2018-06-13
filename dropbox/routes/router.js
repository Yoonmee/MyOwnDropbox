module.exports = function(app){

   const http = require('http');
   // const db = require('../db');
   const sha256 = require('sha256');
   const url = require('url');
   const nodemailer = require("nodemailer");
   const mailconfig = require('../config/mail-config.json');
   // const multer = require('multer');
  //  const _storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'public/images/')
  // },
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname);
  // }
   //  })
// const upload = multer({ storage: _storage })
// //const java = require('java');
// var fs = require('fs');

   var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: mailconfig
   });
   const rand = randomString();
   var mailOptions;

   function randomString() {
      var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      var string_length = 5;
      var randomstr = '';
      for (var i=0; i<string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstr += chars.substring(rnum,rnum+1);
      }
      return randomstr;
   }


//메인 홈 코드
app.get('/', function (req, res) {
            res.render('index');

});

app.get('/blank', function (req, res) {
      res.render('blank');
 });

    app.get('/buttons', function (req, res) {
       res.render('buttons');
 });

 app.get('/error', function (req, res) {
    res.render('error');
});

app.get('/flot', function (req, res) {
   res.render('flot');
});

app.get('/forms', function (req, res) {
   res.render('forms');
});

app.get('/grid', function (req, res) {
   res.render('grid');
});

app.get('/icons', function (req, res) {
   res.render('icons');
});

app.get('/login', function (req, res) {
   res.render('login');
});

app.get('/morris', function (req, res) {
   res.render('morris');
});

app.get('/notifications', function (req, res) {
   res.render('notifications');
});

app.get('/panels-wells', function (req, res) {
   res.render('panels-wells');
});

app.get('/tables', function (req, res) {
   res.render('tables');
});

app.get('/typography', function (req, res) {
   res.render('typography');
});


}
