module.exports = function(app){

   const http = require('http');
   const db = require('../db');
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
    const sess = req.session;
    res.render('index', {
                session : sess
             });
});

app.get('/index', function (req, res) {
  const sess = req.session;
  res.render('index', {
              session : sess
           });

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
      const sess = req.session;
  res.render('login', {
              session : sess
           });
});

app.get('/signup', function (req, res) {
  const sess = req.session;
res.render('signup', {
          session : sess
       });
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

//로그아웃 코드
      app.get('/logout', (req, res) => {

        req.session.destroy(function (err) {
            if (err) throw err;
            res.redirect('/');
        });
    });


app.post('/do_signin',  function (req,res){
       const body = req.body;
       const email = req.body.email;
       var pass = sha256(req.body.password);
       console.log(body);
       var flag = false;
       var id = 0;
       //유저 찾기
       db.query('SELECT * FROM `user` WHERE `user_email` = ? LIMIT 1', [email], (err, result) => {
             if (err) throw err;
             console.log(result);

             if (result.length === 0) {
                   console.log('없음');
                   // res.json({success: false});
                   res.redirect(url.format({
                         pathname: '/login',
                         query: {
                               'success': false,
                               'message': 'Login failed: ID does not exist'
                         }
                   }));
             } else {
                   if (pass != result[0].user_pw) {
                         console.log('비밀번호 불일치');
                         res.redirect(url.format({
                               pathname: '/login',
                               query: {
                                     'success': false,
                                     'message': 'Login failed: Password Incorrect'
                               }
                         }));
                   } else {
                         console.log('로그인 성공');

                         //세션에 유저 정보 저장
                         req.session.user_info = result[0];
                         flag = true;

                      res.redirect('/');
                   }
             }
       });
 });

 app.post("/do_signup", function (req,res){

          var body = req.body;
          var email = body.email;
          var name = body.name;
          var passwd = sha256(body.password);

         db.query('INSERT INTO user(user_email, user_pw, user_name) VALUES(?,?,?) ',
         [email, passwd, name], function(error,result){
            if(error) throw error;
            console.log('추가 완료. result: ',email, passwd, name);

            res.redirect(url.format({
                     pathname: '/login',
                     query: {
                           'success': true,
                           'message': 'Sign up success'
                     }
            }));
            // res.render('registration', {
            //    pass:true
            //    });
         });
       });
}
