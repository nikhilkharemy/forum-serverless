const mysql = require('mysql');
const AWS = require("aws-sdk");
	express = require('express'),
	path = require('path'),
	app = express(),
	bodyParser = require('body-parser'),
	models = require('./models');
const http = require('http2');
const term = require('./routes/term');
const term_detail = require('./routes/term_detail');
const user = require('./routes/user');
const cors = require('cors');
const helper = require('./helper/common');


const topic = require('./routes/topics');
const comment = require('./routes/comment');
const topic_views = require('./routes/topic_views');
const commentactivity = require('./routes/commentactivity');

require('dotenv').config();
global.redis = require("redis");
global.client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST_NAME, {
    no_ready_check: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, 'views')));
app.use(cors())

// Create an instance of the http server to handle HTTP requests
const port = normalizePort(process.env.PORT || '4000');
app.listen(port, (req, res) => {
    console.log(`app running in port ${port}`);
});
app.use((req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    });

    next();
});

// console.log(helper.decrypt('9d193be9bbe5c1580a02668c049e3810'))
// console.log(helper.encrypt('http://forumstatic.niklive.in/profile-images/Sumit-Awasthi.png'))
// console.log(helper.encrypt('romanaik@niknews.in'))
// console.log(helper.encrypt('anuraagm@niknews.in'))
// console.log(helper.encrypt('kumkumb@niknews.in'))
// console.log(helper.encrypt('akhilesha@niknews.in'))
// console.log(helper.encrypt('asthak@niknews.in'))
// console.log(helper.encrypt('adarshj@niknews.in'))
// console.log(helper.encrypt('shobhnay@niknews.in'))
// console.log(helper.encrypt('pratimam@niknews.in'))
// console.log(helper.encrypt('shreyab@niknews.in'))
// console.log(helper.encrypt('shikhat@niknews.in'))

app.use('/term', term);
app.use('/term-detail', term_detail);
app.use('/user', user);
app.use('/topic', topic);
app.use('/comment', comment);
app.use('/topic_views', topic_views);
app.use('/commentactivity', commentactivity);

app.get('/', function(req, res) {
  res.send(process.env.APP_ENV);
});

app.use('/countries', (req, res) => {
  models.countries.findAll({ raw: true }).then(result => {
      res.json({success: true, data: result});
      res.end()
  }).catch((err)=>{
      res.status(401).json({success: false, msg: 'Please retry later!'});
      res.end()
  }) 
})
app.use('/states/:cId', (req, res) => {
  models.states.findAll({where: {countryId: req.params.cId}}).then(result => {
      res.json({success: true, data: result});
      res.end()
  }).catch((err)=>{
      res.status(401).json({success: false, msg: 'Please retry later!'});
      res.end()
  }) 
})
app.use('/cities/:sId', (req, res) => {
  models.cities.findAll({where: {stateId: req.params.sId}}).then(result => {
      res.json({success: true, data: result});
      res.end()
  }).catch((err)=>{
      res.status(401).json({success: false, msg: 'Please retry later!'});
      res.end()
  }) 
})
app.post('/profile/update', (req, res) => {
  console.log(req);
})

helper.initializeFirebase();
// helper.listAllUsers() 




function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
}
