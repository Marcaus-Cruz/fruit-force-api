'use strict';
const AWS     = require('aws-sdk');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const docClient = new AWS.DynamoDB.DocumentClient();
const { USERS_TABLE, JWT_SECRET } = process.env;

module.exports.handler = async (event) => {
  const { username, password } = JSON.parse(event.body);
  // check exists
  const { Item } = await docClient.get({
    TableName: USERS_TABLE,
    Key: { username }
  }).promise();
  if (Item) {
    return { statusCode: 400, body: JSON.stringify({ msg: 'User exists' }) };
  }
  // hash & save
  const hashed = await bcrypt.hash(password, 10);
  await docClient.put({
    TableName: USERS_TABLE,
    Item: { username, password: hashed }
  }).promise();

  const token = jwt.sign({ user: { username } }, JWT_SECRET, { expiresIn: '1h' });
  return { statusCode: 200, body: JSON.stringify({ token }) };
};
