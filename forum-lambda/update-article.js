var AWS = require("aws-sdk");

AWS.config.update({
	"region" : "ap-south-1",
	"endpoint" : "https://dynamodb.ap-south-1.amazonaws.com",
	"accessKeyId" : "xxxxxxxxxxxxx",
	"secretAccessKey" : "xxxxxxxxxxx"
});

var docClient = new AWS.DynamoDB.DocumentClient()

var table = "manch";

var _id = 1;

// Update the item, unconditionally,

var params = {
    TableName:table,
    Key:{
        "id": _id,
    },
    UpdateExpression: "set updatedAt = :e",
    ExpressionAttributeValues:{
        ":e": "2019-01-11T07:03:55.597Z"
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