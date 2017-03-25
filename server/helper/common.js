const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const express = require('express');
const firebase = require("firebase/app");
const helper = express.Router();
const url = require('url');
const http = require('http');
const crypto = require('crypto'),
    algorithm = 'aes-128-cbc';
const key = Buffer.from('5ebe2294ecd0e0f08eab7690d2a6ee69', 'hex');
const iv  = Buffer.from('26ae5cc854e36b6bdfca366848dea6bb', 'hex');
require('dotenv').config();
const apiUrl = process.env.API_URL || 'https://api.abpmanch.com/';
const purgeUrl = process.env.PURGE_URL || 'https://wahcricket.com/general_cms/api/clear_akamai_cache.php';

//code to initialise firebase
const admin = require('firebase-admin');

//middleware function
helper.loginMiddleware = (req, res, next) => {
	if(req.headers.authorization){
		const token = req.headers.authorization;
		admin.auth().verifyIdToken(token)
	    .then(data => {
			next();
		}).catch(err => {
			res.status(401).json({success:false, msg: 'User Not Authenticated'});
	    })
	}
	else{
		res.status(401).json({success:false, msg: 'User Not Authenticated'});
	}
};

helper.emailVerifiedMiddleware = (req, res, next) => {
	const token = req.headers.authorization;
	admin.auth().verifyIdToken(token)
        .then(data => {
			next();
		}).catch(err => {
			res.status(401).json({success:false, msg: 'User Not Authenticated'});
        })
};

helper.listAllUsers = () => {
  	// admin.auth().listUsers(1000)
   //  .then(function(listUsersResult) {
   //  	// console.log(listUsersResult.users[0].toJSON().uid)
   //  	// console.log(typeof listUsersResult.users[0])
   //   //  	listUsersResult.users.forEach(function(userRecord) {
   //   //  		admin.auth().deleteUser(userRecord.toJSON().uid)
			//   // .then(function() {
			//   //   console.log('Successfully deleted user' + userRecord.toJSON().uid);
		 //  	// })
		 //  	// .catch(function(error) {
			//   //   console.log('Error deleting user:', error);
		 //  	// });
   //   //  	});
   //  })
   //  .catch(function(error) {
   //    console.log('Error listing users:', error);
   //  });
}

admin.initializeApp({
	credential: admin.credential.cert({
		projectId: 'nice-argon-95105',
		clientEmail: "firebase-adminsdk-hvqcm@nice-argon-95105.iam.gserviceaccount.com",
		privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDyUggj77BCrkld\n2kJ0SLu8BFyj8bAelP865Tvk6PjU5P7jyAJjd3IR+zMVs7mjPEgSO0tSCCWOjjdh\ny4Amor4LKOIgVv8v85aWOv0b5S8JWgjKSAdqrJL7cnbuNGz1N3hYuINt8u1sqdnp\ns5e1VAm6uDirRIKWOExVOYEGy9YFXf/I/Bkf9fOgh6xL8M4h5QfxtGzUjntk4wtC\nG8ggDiEdjsjy82NRHw8KwXHcrQr4CHMW8HLmePAclET35afgf+JQGwHAWrW4PoXQ\nEXT1QNm6Aqn+Q7fCTIweeTn4PGd13TAvjil9EAjlFaxrJGbSr7Uuy4WJ9CPZjewT\np7vnPbl7AgMBAAECggEAHoJ0ku29UA/4nc/6uQBlXr1f2qZ2CcuxvP0axu4MUmXI\nr+5BWruxyZDKtEtOLr7Kxjzf9WKgM+w1DeOc7YBlFCugGPlLJQLy7VRdBPOcsf07\niRh7kpNK6EzXq5M/OrqytNz6c0/4U8uo67NYgRSlKvTB8dJs7LQG7F4SoEPu3Prj\nmYx4UeaLllmR7fRZcOOFlwIqS0NiymLAk3AKbB8x+m8jH0OD5sCpRitqXNunmRYO\niQqTfb9Zrpj03pJoK6wVyveGLgwt/zirIGK2YWk+QLUHo+1yGM6QBKm0hg0LmHxj\nL0v7p4Fo2uTXcEW+6s8cBI7+V8YwhRX13CgMCHybzQKBgQD/vYd+0sMwPvmzMEnv\n/CSdUoEf6nDkWAA/s9zDOzWsaHqd4chXY0dPRRUUMW+OZbrW2PJeEimGrjdNbuV9\nyEifKIoxpJVzvcc6NC3X+JFGmwZkS346eDN6DOdCTYHlPQfmlzZyN0D8JLtHMF2g\n6jzDnJSVqCTSbU1BA8RBNMKXPQKBgQDykQO1RBjD0ZRq4+RQusuWBkGj1RNFzcfK\nE3pbri0qZjXj6kJLYbfK+jEybXQ7Ig0XPIPvrspxPEUAXFzzoNsmtA0P6JGVs5XE\nK0pD/S2rWlOsaCOSKUTWF0mM01ZzGLUn+WHwpzVvflOXOOjFLV6U0VV731+W0QV1\nlmIlqFTfFwKBgFKnMax2d6kXIWKdX7gVOMwzxxHGlnfmTSZJfjcG4uD233I5b6N2\nraxb+mUNWS2fiVQ4x5RJsGwb0DnRdpBBc98kng1PURIYKtSP2qUra+By6AzwLTq+\ncHyowPE31Zx+LhiDlJAzdWhIgtKOOiRwr/TUnV0E++mac9ZoXjxozd9NAoGAPUu5\n5Sd1Hp6qY6x8+I2LfrjMA4uHmD8c+oqbg+lqzmkPuy1qXUQvPqKkpfqUwZCkQDfx\nmzLPQ3gYc7PjZUlDt+8N0fRSPcMo2G6cELw8uy1TMaELRBcbpwIxet243dLjjFtv\njXGjhi4lD3S5FYKWgQK5GFlk/WaKe6Fp4dw8vjcCgYAyvBZPPXCDPtgc4OuFE9pZ\nRI7gWzfbZS6AyhmZzat1Cs4TrEdTfOH2gYWxjCdxYiOJbQTf+9iuZwf4hEwwx28G\nu5XdcXgO/hbxhiW3CQyYF3ll5cGIVaUA9X7sXLhwsyKfUQWsnCp6Y3wTRK6xI2Hz\ntBPxmBWUptkUu3yspKocGA==\n-----END PRIVATE KEY-----\n"
	  })
})

helper.getArticleId = (articleUrl) => {
var fields = articleUrl.split(/-/);
var position = fields.length-1;
return(fields[position]);
}

helper.getLangId = (langName) => {
	switch (langName) {
				case "english":
				return 1;
				break;
				case "hindi":
				return 3;
				break;
				case "marathi":
				return 5;
				break;
				case "bengali":
				return 7;
				break;
				case "punjabi":
				return 519;
				break;
				case "gujarati":
				return 4;
				break;
				case "abpganga":
				return 6;
				break;
				default:
				return 1;
				break;
	}
}

helper.getLangName = (langId) => {
	switch (langId) {
				case 1:
				return "english";
				break;
				case 3:
				return "hindi";
				break;
				case 5:
				return "marathi";
				break;
				case 7:
				return "bengali";
				break;
				case 519:
				return "punjabi";
				break;
				case 4:
				return "gujarati";
				break;
				case 6:
				return "abpganga";
				break;
				default:
				return "hindi";
				break;
	}
}

helper.getLang = (lang, isId) => {
    let langCode;
    if (isId) {
      lang = Number(lang);
      switch (lang) {
        case 1:
          langCode = "en";
          break;
        case 4:
          langCode = "gu";
          break;
        case 5:
          langCode = "mr";
          break;
        case 7:
          langCode = "bn";
          break;
        case 519:
          langCode = "pa";
          break;
        default:
          langCode = "hi";
      }
    } else {
      switch (lang) {
        case "en":
          langCode = 1;
          break;
        case "gu":
          langCode = 4;
          break;
        case "mr":
          langCode = 5;
          break;
        case "bn":
          langCode = 7;
          break;
        case "pa":
          langCode = 519;
          break;
        default:
          langCode = 3;
      }
    }
    return langCode;
  }

helper.initializeFirebase = () => {
	// Your web app's Firebase configuration
	var firebaseConfig = {
	apiKey: "AIzaSyDnXYnSvaz3HajWwJTkvas5CW0u5PEkkO4",
	// authDomain: "nice-argon-95105.firebaseapp.com",
    authDomain: "auth.abpmanch.com",	
    databaseURL: "https://nice-argon-95105.firebaseio.com",
    projectId: "nice-argon-95105",
    storageBucket: "nice-argon-95105.appspot.com",
    messagingSenderId: "624288627215",
    appId: "1:624288627215:web:fc7d7127b43d374c"
	  };
	  // Initialize Firebase if not initialized
	  if (!firebase.apps.length) {
		firebase.initializeApp(firebaseConfig);		
	 }
}




helper.convertToSlug = (Text) => {
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

helper.getRefererId = (referer) => {
    switch(referer){
        case 'wordpress':
            return '1';
        default:
            return '0';
    }
}

helper.isAuthenticated = (token) =>{
    return admin.auth().verifyIdToken(token);
};



helper.getCurrentDateTime = () => {
    var currentdate = new Date(); 
    var datetime =  currentdate.getFullYear() + "-"
                    + (currentdate.getMonth()+1) + "-"  
                    + currentdate.getDate()  + " " 
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    return datetime;
}

helper.getCognitoIdFromToken = (token) => {
	const decodedJwt = jwt.decode(token, {complete: true});
	if (!decodedJwt) {
        return { message: "Not a valid JWT token", success: false};
    }
    else
        return { userId: decodedJwt.payload.sub, success: true};
}

helper.fetchJSONcontent = (link,callback) => {
	var urlarr = url.parse(link, true);
	var host = urlarr.host; //returns 'localhost:8080'
	var path = urlarr.pathname; //returns '/default.htm'
	var params = urlarr.search; //returns '?year=2017&month=february'
	
		var options = {
		host: host,
		path: path,
		headers: {'User-Agent': 'request'}
	};
	
	http.get(options, function (res) {
		var json = '';
		res.on('data', function (chunk) {
			json += chunk;
		});
		console.log('yy')
		res.on('end', function () {
			console.log('ersd')
			if (res.statusCode === 200) {
				callback({success: true, data: JSON.parse(json)});
			// 	try {
			// console.log('try')
			// 		return;
			// 	} catch (e) {
			// console.log('ee')
			// 		callback({success: false})
			// 		return;
			// 	}
			} else {
			console.log('cb')
				callback({success: false})
				return;
			}
		});
	}).on('error', function (err) {
		  console.log('Error:', err);
	});
}
helper.encrypt = (text) => {
	//handle empty text condn
	if(text == undefined){
		return text;
	}
  var cipher = crypto.createCipheriv(algorithm, key, iv);
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

 
helper.decrypt = (text) => {
	//handle empty text condn
	if(text == undefined || text == ''){
		return text;
	}
  var decipher = crypto.createDecipheriv(algorithm, key, iv)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

helper.jsUcfirst = (string) => {
	return string.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
}
helper.purgeCach = (urls) => {
	let EdgeGrid = require('edgegrid');
	var config = {
	  clientToken: 'akab-g4day4vv65rhm2wa-wxc4t2hrjj76pxns',
	  clientSecret: 'R5W/G1Bo2QBucOk5qeldNLgOUq3E2HQNcW7HpBcdxJ8=',
	  accessToken: 'akab-p7ovz6fjib7l5xqj-l2seh6ybciolagft',
	  baseUri: 'https://akab-pzgw3sqg6eyawvny-xlit3gjfz6omr42w.purge.akamaiapis.net' //typically something like 'https://xxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxx.purge.akamaiapis.net', no trailing "/"
	};

	var eg = new EdgeGrid(config.clientToken, config.clientSecret, config.accessToken, config.baseUri);

	eg.auth({
	  path: "/ccu/v3/invalidate/url/production",
	  method: "POST",
	  body: {
	    action: "invalidate",
	    objects: urls
	  }
	}).send(function (error, response, body) {
	  console.log(body);
	})
}


module.exports = helper;