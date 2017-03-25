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
    TableName: table
};

docClient.scan(params, function(err, data) {
    if (err) {
        console.error("Unable to read forums data. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Forum data received:", JSON.stringify(data, null, 2));
    }
});
