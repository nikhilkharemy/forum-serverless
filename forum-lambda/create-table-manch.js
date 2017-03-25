//JavaScript - Create new DynamoDB table "vcms" in AWS environment
var AWS = require("aws-sdk");
AWS.config.update({
  "region": "ap-south-1",
  "endpoint": "https://dynamodb.ap-south-1.amazonaws.com",
  "accessKeyId": "xxxxxxxxxxx", "secretAccessKey": "xxxxxxxxxxxxxxx"
});
var dynamodb = new AWS.DynamoDB();
var params = {
    TableName : "manch",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH"},  //Partition key
],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "N" },
],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};
dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});