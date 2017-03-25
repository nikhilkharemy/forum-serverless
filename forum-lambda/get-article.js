var AWS = require("aws-sdk");

AWS.config.update({
"region" : "ap-south-1",
"endpoint" : "https://dynamodb.ap-south-1.amazonaws.com",
"accessKeyId" : "xxxxxxxxxxxxxx",
"secretAccessKey" : "xxxxxxxxxxxxxx"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "manch";

var id = 1;

var params = {
    TableName: table,
    Key:{
        "id": id
    }
};

docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read article. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Get article succeeded:", JSON.stringify(data, null, 2));
    }
});
