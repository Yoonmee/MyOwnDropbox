module.exports = function(app){

   const http = require('http');
   const db = require('../db');
   const sha256 = require('sha256');
   const url = require('url');
   const nodemailer = require("nodemailer");
   const mailconfig = require('../config/mail-config.json');
   const multer = require('multer');
   const aws = require('aws-sdk');
   const multerS3 = require('multer-s3');
   const s3 = new aws.S3();
   var fs = require('fs');
   var bucketname = "hyunjunhw6"

   aws.config.update({
   	accessKeyId: 'AKIAIFLEZQDRG7CAHDVA',
       secretAccessKey: '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',
       region: 'us-west-2'
   });


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

app.get('/mypage', function (req, res) {
  const sess = req.session;
  res.render('setting', {
              session : sess
           });

});

app.get('/blank', function (req, res) {
  const sess = req.session;
  res.render('blank', {
              session : sess
           });
});

app.get('/buttons', function (req, res) {
  const sess = req.session;
  res.render('buttons', {
              session : sess
           });

});

app.get('/error', function (req, res) {
  const sess = req.session;
  res.render('error', {
              session : sess
           });

});

app.get('/flot', function (req, res) {
  const sess = req.session;
  res.render('flot', {
              session : sess
           });

});

app.get('/forms', function (req, res) {
  const sess = req.session;
  res.render('forms', {
              session : sess
           });

});

app.get('/grid', function (req, res) {
  const sess = req.session;
  res.render('grid', {
              session : sess
           });

});

app.get('/icons', function (req, res) {
  const sess = req.session;
  res.render('icons', {
              session : sess
           });

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
  const sess = req.session;
  res.render('morris', {
              session : sess
           });

});

app.get('/notifications', function (req, res) {
  const sess = req.session;
  res.render('notifications', {
              session : sess
           });

});

app.get('/panels-wells', function (req, res) {
  const sess = req.session;
  res.render('panels-wells', {
              session : sess
           });

});

app.get('/tables', function (req, res) {
  const sess = req.session;
  var files = [];
  s3.listObjects({ Bucket: bucketname }, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {

      console.log(data.Contents.length + " files found in '"+bucketname+"' bucket");

      // var id = sess.user_info.user_id;
      var id = '2';
      var vld = id+ '/';
      var i = 0;
      // files = data.Contents;
      data.Contents.forEach(function(currentValue, index, array){

          if(vld==currentValue.Key.substring(0, id.length + 1)){
        // var vld = currentValue.Key.substring(0, sess.user_info.user_id.length+1)
        //   if(vld ==  sess.user_info.user_id + '/'){

            fs.exists(bucketname + "/" + currentValue.Key, function(exists){

                files[i] = currentValue;
                i++;
                console.log(index + " " +  files[index].Key);
              });
           }else{}
        // Check if the file already exists?

            // s3.getObject({ Bucket: bucket, Key: currentValue.Key }, function(err, data)   {
            //   if (err) console.log(err, err.stack); // an error occurred
            //   else {
            //
            //     fs.writeFile(bucket + "/" + currentValue.Key, data.Body, function(){
            //     });
            //   }
            // });

          });
          res.render('tables', {
                      session : sess,
                      file : files
                   });
        }
      });
});

app.get('/typography', function (req, res) {
  const sess = req.session;


  res.render('typography', {
              session : sess
           });

});


app.get('/upload', function (req, res) {
  const sess = req.session;

   res.render('upload', {
               session : sess
            });
});


var upload = multer({
   storage: multerS3({
       s3: s3,
       bucket: bucketname,
       key: function (req, file, cb) {
           cb(null, req.session.user_info.user_id+"/"+file.originalname);
       }
   })
});

app.post('/do_upload', upload.single('uploadFile'), function (req, res, next) {
const sess = req.session;

  db.query('INSERT INTO file(file_name, file_path, user_id) VALUES(?,?,?) ',
  [req.file.originalname, "" ,sess.user_info.user_id], function(error,result){
     if(error) throw error;
     console.log('추가 완료. result: ',req.file.originalname,sess.user_info.user_id);

     res.redirect(url.format({
              pathname: '/tables',
              query: {
                    'success': true,
                    'message': 'Sign up success'
              }
     }));

  });
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

                         fs.exists(bucketname + "/" + req.session.user_info.user_id, function(exists){
                                    if (exists)
                                    {
                                      console.log("directory exists");
                                    }
                                    else
                                    {
                                      var params = { Bucket: bucketname , Key : req.session.user_info.user_id +'/', ACL: 'public-read', Body:'body does not matter' };
                                      s3.upload(params, function (err, data) {
                                      if (err) {
                                          console.log("Error creating the folder: ", err);
                                          } else {

                                          console.log("Successfully created a folder on S3");
                                          }
                                            res.redirect('/');
                                      });
                                    }
                                  });


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
