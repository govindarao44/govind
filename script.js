const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static("public"));
app.use(express.static("views"));
const admin = require('firebase-admin');
const serviceAccount = require('./phkey.json');
app.use(bodyParser.urlencoded({ extended: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render(__dirname + "/views/" + "home.ejs");
});

app.get('/signup', function (req, res) {
  res.render(__dirname + "/views/" + "signup.ejs");
});

app.get('/login', function (req, res) {
  res.render(__dirname + "/views/" + "login.ejs");
});
app.get('/contactus', function (req, res) {
    res.render(__dirname + "/views/" + "contactus.ejs");
  });


app.get('/signupsubmit', function (req, res) {
  db.collection('users')
    .add({
      Name: req.query.Name,
      email: req.query.email,
      password: req.query.password,
      CPassword: req.query.CPassword
    })
    .then(() => {
      res.render(__dirname + "/views/" + "login.ejs");
    });
});

app.get('/loginsubmit', function (req, res) {
  db.collection('users')
    .where("email", "==", req.query.email)
    .where("password", "==", req.query.password)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.render("bike");
      } else {
        res.send("Failed, Please signup first");
      }
    });
});

app.get('/bikesubmit', (req, res) => {
  const name = req.query.gds; 

  request.get({
    url: 'https://api.api-ninjas.com/v1/validatephone?number=' + name,
    headers: {
      'X-Api-Key': 'JGd9JsPpqrSrCcnuaGeHlA==PMfE74xZYKL5JINN'
    },
  }, function(error, response, body) {
    if("error" in JSON.parse(body)){
        if((JSON.parse(body).error.code.toString()).length > 0){
          res.render(__dirname+"/public/"+"bike.ejs");
        }
      }
    else{
        const is_valid=JSON.parse(body).is_valid;
        const country = JSON.parse(body).country;
        const location= JSON.parse(body).location;
        const timezones= JSON.parse(body).timezones;
        const format_national= JSON.parse(body).format_national;
        const country_code = JSON.parse(body).country_code
        res.render(__dirname + "/views/main.ejs", {
            is_valid: is_valid,
            country: country,
            location: location,
            timezones:timezones,
            format_national:format_national,
            country_code:country_code
        });
    }   
  }
);
});

app.listen(3003, function () {
  console.log('Examle app listening on port 3003!');
});
