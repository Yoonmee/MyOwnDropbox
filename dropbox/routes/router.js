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
  if (!sess.user_info) {
              res.redirect('/');
        }
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
  if (!sess.user_info) {
              res.redirect('/');
        }
  var files = [];
  s3.listObjects({ Bucket: bucketname }, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {

      console.log(data.Contents.length + " files found in '"+bucketname+"' bucket");

      // var id = sess.user_info.user_id;
      var id = sess.user_info.user_id;
      var vld = id+ '/';
      var i = 0;
      // files = data.Contents;
      data.Contents.forEach(function(currentValue, index, array){

          if(vld==currentValue.Key.substring(0, id.length + 1)){
        // var vld = currentValue.Key.substring(0, sess.user_info.user_id.length+1)
        //   if(vld ==  sess.user_info.user_id + '/'){
        files[i] = currentValue;
        i++;
        }
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
  if (!sess.user_info) {
              res.redirect('/');
        }

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


app.post('/make_folder',  function (req,res){
  const sess = req.session;
  if (!sess.user_info) {
              res.redirect('/');
        }
       const body = req.body;
       const foldername = req.body.foldername;

       fs.exists(bucketname + "/" + foldername, function(exists){
                  if (exists)
                  {
                    console.log("directory exists");
                  }
                  else
                  {
                    var params = { Bucket: bucketname , Key : req.session.user_info.user_id+'/'+foldername +'/', ACL: 'public-read', Body:'body does not matter' };
                    s3.upload(params, function (err, data) {
                    if (err) {
                        console.log("Error creating the folder: ", err);
                        } else {

                        console.log("Successfully created a folder on S3");
                        }
                          res.redirect('/tables');
                    });
                  }
                });
 });

 app.post('/file_download',  function (req,res){
      const sess = req.session;
      if (!sess.user_info) {
              res.redirect('/');
        }
        const body = req.body;
        var checkedfile = [];
        checkedfile = req.body.filechecked;
        console.log(checkedfile.length);
        for(var i = 0; i<checkedfile.length; i++)
        {
          var temp = checkedfile[i];
            console.log('filechecked' + temp);

            var params = {  Bucket: bucketname, Key: temp };
            s3.getSignedUrl('getObject', params, function(err, url){
              console.log(url);
            });

            // res.attachment(temp);
            // var fileStream = s3.getObject(params).createReadStream();
            // fileStream.pipe(res);

            // s3.getObject(params, { stream : true }, function(err, data) {
            //   if (err) console.log(err, err.stack);  // error
            //   else {    console.log();
            //   res.attachment(temp);
            //   data.Stream.pipe(res);}
            // });

            var file = require('fs').createWriteStream(temp);
            var params = {Bucket:bucketname, Key:temp};
            if(temp.substring(temp.length-1,  temp.length)=='/'){
              fs.mkdir(bucketname + "/" + temp,function() {});
                console.log('download folder' + temp);
            }
              else{
            fs.writeFile(bucketname + "/" +  temp, function(){
              console.log('download' + temp);

            });}
            s3.getObject(params).createReadStream().pipe(file);

            //
            //
            //   s3.getObject({ Bucket: bucketname , Key: temp }, function(err, data)   {
            //   if (err) console.log(err, err.stack); // an error occurred
            //   else {
            //     if(temp.substring(temp.length-1,  temp.length)=='/'){
            //       fs.mkdir(bucketname + "/" + temp,function() {});
            //         console.log('download folder' + temp);
            //     }
            //       else{
            //     fs.writeFile(bucketname + "/" +  temp, data.Body, function(){
            //       console.log('download' + temp);
            //     });}
            //   }
            // });

            // s3.getObject(params, function(err, data)   {
            //             if (err) console.log(err, err.stack); // an error occurred
            //             else if(temp.substring(temp.length-1, temp.length)=='/'){
            //               fs.mkdir(temp,function() {});
            //             }
            //             else fs.writeFile(temp, data.Body, function(){});
            //             }
            //           );
          //

        }
          res.redirect('/tables');
  });


   async function asyncForEach(array, callback) {
     for (let index = 0; index < array.length; index++) {
       await callback(array[index], index, array)
     }
   }



  app.post('/file_share',  function (req,res){
    var sharelink = [];
       const sess = req.session;
       if (!sess.user_info) {
              res.redirect('/');
        }
         const body = req.body;
         var checkedfile = [];
         var ctr = 0;
         checkedfile = req.body.filechecked;
         console.log(checkedfile.length);
      //
      //
      //    asyncForEach(checkedfile, async () => {
      //      await waitFor(50)
      //      var temp = checkedfile[index];
      //        console.log('filechecked' + temp);
      //
      //        var params = {  Bucket: bucketname, Key: temp };
      //        s3.getSignedUrl('getObject', params, function(err, url){
      //          sharelink[index] = url;
      //
      //          console.log(sharelink[index]);
      //    })
      //  })
      //  res.render('share', {
      //     links : sharelink,
      //     session : sess
      // });
      // var index = 0;
      // async () => {
      //   asyncForEach(checkedfile, async () => {
      //     await waitFor(50)
      //     var temp = checkedfile[index];
      //       console.log('filechecked' + temp);
      //
      //       var params = {  Bucket: bucketname, Key: temp };
      //       s3.getSignedUrl('getObject', params, function(err, url){
      //         sharelink[index] = url;
      //
      //         console.log(sharelink[index]);
      //         index++;
      //   })
      // })



        //  console.log('Done')
          checkedfile.forEach(function(currentValue, index, array){
                ctr++;
                  var temp = checkedfile[index];
                    console.log('filechecked' + temp);

                    var params = {  Bucket: bucketname, Key: temp };
                    s3.getSignedUrl('getObject', params, function(err, url){
                      sharelink[index] = url;

                      console.log(sharelink[index]);
                    });
                if (ctr === array.length) {
                  req.session.share = sharelink;
                    res.render('share', {
                       links : sharelink,
                       session : sess
                   });
                }
        });
       //  res.render('share', {
       //     links : sharelink,
       //     session : sess
       // });
 });

 app.get('/imgs', function (req, res) {
 fs. readFile('logo.png', function(error,result){
 res.writeHead(200, { 'Content-Type':'text/html'});
 res.end(data);
 });
 });


 app.get('/changeinfo', function (req, res) {
   const sess = req.session;
   res.render('changeinfo', {
               session : sess
            });

 });

  app.get("/change_user_info", function (req,res){
   const sess = req.session;
   if (!sess.user_info) {
              res.redirect('/');
        }
          db.query('DELETE FROM user WHERE user_email = ? ',
          [sess.user_info.user_email], function(error,result){
             if(error) throw error;
             console.log('삭제 완료.');

             res.redirect(url.format({
                      pathname: '/',
                      query: {
                            'success': true,
                            'message': 'delete user success'
                      }
             }));
          });
        });


  app.post('/changeinfo', function (req,res){
   const sess = req.session;
   if (!sess.user_info) {
                 res.redirect('/');
           }
    var body = req.body;
           var name = body.name;
           var passwd = sha256(body.password);

          db.query('UPDATE user SET user_name = ?, user_pw WHERE user_email = ?  ',
          [name, passwd, sess.user_info.user_email], function(error,result){
             if(error) throw error;
             console.log('수정 완료. result: ', name, passwd);

             res.redirect(url.format({
                      pathname: '/mypage',
                      query: {
                            'success': true,
                            'message': 'delete user success'
                      }
             }));
          });
        });

    app.get('/share', function (req, res) {
      const sess = req.session;
      if (!sess.user_info) {
                    res.redirect('/');
              }
      res.render('share', {
                  links : sharelink,
                  session : sess
               });

    });

  app.post('/file_delete',  function (req,res){

         const sess = req.session;
         if (!sess.user_info) {
              res.redirect('/');
        }
           const body = req.body;
           var checkedfile = [];
           checkedfile = req.body.filechecked;
           console.log(checkedfile.length);
           for(var i = 0; i<checkedfile.length; i++)
           {
             var temp = checkedfile[i];
               console.log('filechecked' + temp);

               var params = {  Bucket: bucketname, Key: temp };
               s3.deleteObject(params, function(err, data) {
                 if (err) console.log(err, err.stack);  // error
                 else     console.log();                 // deleted
               });
             }
             res.redirect('/tables');
   });


app.post('/do_upload', upload.single('uploadFile'), function (req, res, next) {
const sess = req.session;
if (!sess.user_info) {
              res.redirect('/');
        }

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


  app.get("/user_theme_change_1", function (req,res){
const sess = req.session;
          db.query('UPDATE user SET user_theme = 1 WHERE user_email = ? ',
          [sess.user_info.user_email], function(error,result){
             if(error) throw error;
             console.log('변경 완료. result: ',sess.user_info.user_id);
             sess.user_info = result[0];
             res.redirect(url.format({
                      pathname: '/mypage',
                      query: {
                            'success': true,
                            'message': 'theme change success'
                      }
             }));
          });
        });

  app.get("/user_theme_change_2", function (req,res){
const sess = req.session;
          db.query('UPDATE user SET user_theme = 2 WHERE user_email = ? ',
          [sess.user_info.user_email], function(error,result){
             if(error) throw error;
             console.log('변경 완료. result: ',sess.user_info.user_id);
            sess.user_info = result[0];
             res.redirect(url.format({
                      pathname: '/mypage',
                      query: {
                            'success': true,
                            'message': 'theme change success'
                      }
             }));
          });
        });


  app.get("/user_theme_change_3", function (req,res){
const sess = req.session;
          db.query('UPDATE user SET user_theme = 3 WHERE user_email = ? ',
          [sess.user_info.user_email], function(error,result){
             if(error) throw error;
             console.log('변경 완료. result: ',sess.user_info.user_id);
             sess.user_info = result[0];
             res.redirect(url.format({
                      pathname: '/mypage',
                      query: {
                            'success': true,
                            'message': 'theme change success'
                      }
             }));
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
