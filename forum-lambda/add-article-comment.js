var AWS = require("aws-sdk");

AWS.config.update({
	"region" : "ap-south-1",
	"endpoint" : "https://dynamodb.ap-south-1.amazonaws.com",
	"accessKeyId" : "xxxxxxxxxxxx",
	"secretAccessKey" : "xxxxxxxxxxxxxxx"
});

var docClient = new AWS.DynamoDB.DocumentClient()

var table = "forum";

var _id = 4;

// Update the item, unconditionally,

var params = {
    TableName:table,
    Key:{
        "id": _id,
    },
    UpdateExpression: "set comments = :e",
    ExpressionAttributeValues:{
        ":e": [{
            "id": 34165,
            "createdAt": "2019-01-11T11:23:55.341Z",
            "updatedAt": "2019-01-11T11:23:55.341Z",
            "body": "The story is narrated somewhat in the form of a documentary through the lens of political commentator Sanjay Baru, the man who wrote the book of same name which inspired the makers of this movie. It has effective mix and match of actual clippings of those times intertwined with director’s portrayal of political figures. It starts with UPA victory in general elections of 2004, accession of Dr. Manmohan Singh as Prime Minister of India, covering few major highlights of his tenure and finally their embarrassing rout in 2014 elections.",
            "author": {
                "username": "new-demo",
                "bio": null,
                "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
                "following": false
            }
        },
        {
            "id": 34164,
            "createdAt": "2019-01-11T11:23:44.271Z",
            "updatedAt": "2019-01-11T11:23:44.271Z",
            "body": "The story is narrated somewhat in the form of a documentary through the lens of political commentator Sanjay Baru, the man who wrote the book of same name which inspired the makers of this movie. It has effective mix and match of actual clippings of those times intertwined with director’s portrayal of political figures. It starts with UPA victory in general elections of 2004, accession of Dr. Manmohan Singh as Prime Minister of India, covering few major highlights of his tenure and finally their embarrassing rout in 2014 elections.",
            "author": {
                "username": "new-demo",
                "bio": null,
                "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
                "following": false
            }
        },
        {
            "id": 34160,
            "createdAt": "2019-01-11T09:41:11.918Z",
            "updatedAt": "2019-01-11T09:41:11.918Z",
            "body": "इस फिल्म में मनमोहन सिंह के किरदार में अनुपम खेर हैं और संजय बारु की भूमिका में अक्षय खन्ना हैं",
            "author": {
                "username": "new-demo",
                "bio": null,
                "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
                "following": false
            }
        }]
    },
    ReturnValues:"UPDATED_NEW"
};

console.log("Updating the article...");
docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update article. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Article update succeeded:", JSON.stringify(data, null, 2));
    }
});