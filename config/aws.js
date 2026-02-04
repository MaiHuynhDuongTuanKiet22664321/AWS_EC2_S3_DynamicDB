require('dotenv').config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

const awsConfig = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
};

const dynamoClient = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client(awsConfig);

module.exports = {
    docClient,
    s3Client
};
