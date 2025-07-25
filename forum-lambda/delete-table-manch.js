var AWS = require("aws-sdk");

AWS.config.update({
	  "region": "ap-south-1",
	  "endpoint": "https://dynamodb.ap-south-1.amazonaws.com",
	  "accessKeyId": "xxxxxxxxxxxx", "secretAccessKey": "xxxxxxxxxxxxxx"
	});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "forum"
};

dynamodb.deleteTable(params, function(err, data) {
    if (err) {
        console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});