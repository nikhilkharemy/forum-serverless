var AWS = require("aws-sdk");

AWS.config.update({
	"region" : "ap-south-1",
	"endpoint" : "https://dynamodb.ap-south-1.amazonaws.com",
	"accessKeyId" : "xxxxxxxxxxxxxx",
	"secretAccessKey" : "xxxxxxxxxxxxxx"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "manch";

var params = {
    TableName:table,
    Item:{
    	"id": 5,
    	"author": {
    		"bio": null,
    		"following": false,
    		"image": "http://dashboard.abplive.in/assets/images/EngLogo64x99.png",
    		"username": "vinodt"
    	},
    	"body": "Accidental Prime Minister",
    	"createdAt": "2019-01-11T07:06:56.597Z",
    	"description": "Movie Review: मेकर्स की मंशा पर गंभीर सवाल खड़े करती है फिल्म The Accidental Prime Minister",
    	"favorited": false,
    	"favoritesCount": 0,
    	"slug": "demo-article-001-gh571d",
    	"tagList": [],
    	"title": "Demo Article 001",
    	"updatedAt": "2019-01-11T07:06:56.597Z",
    	"comments":[]
    }
};

console.log("Creating new article...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to create article. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added article:", JSON.stringify(data, null, 2));
    }
});