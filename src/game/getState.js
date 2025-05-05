'use strict';
const AWS     = require('aws-sdk');
const jwt     = require('jsonwebtoken');
const docClient = new AWS.DynamoDB.DocumentClient();
const { GAMESTATE_TABLE, JWT_SECRET } = process.env;

module.exports.handler = async (event) => {
  const token = event.headers.Authorization?.split(' ')[1] || '';
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return { statusCode: 401, body: JSON.stringify({ msg: 'Auth failed' }) };
  }

  const username = payload.user.username;
  const { Item } = await docClient.get({
    TableName: GAMESTATE_TABLE,
    Key: { userId: username }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ state: Item?.state || {} })
  };
};
