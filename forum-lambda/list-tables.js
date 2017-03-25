//JavaScript - Create new DynamoDB table "vcms" in AWS environment
var AWS = require("aws-sdk");
AWS.config.update({
  "region": "ap-south-1",
  "endpoint": "https://dynamodb.ap-south-1.amazonaws.com",
  "accessKeyId": "xxxxxxxxxxxxx", "secretAccessKey": "xxxxxxxxxxxxxxx"
});
var dynamodb = new AWS.DynamoDB();

var params = {
};
dynamodb.listTables(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});