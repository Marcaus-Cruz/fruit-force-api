'use strict';
const AWS     = require('aws-sdk');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const docClient = new AWS.DynamoDB.DocumentClient();
const { USERS_TABLE, JWT_SECRET } = process.env;

module.exports.handler = async (event) => {
  const { username, password } = JSON.parse(event.body);
  const { Item: user } = await docClient.get({
    TableName: USERS_TABLE,
    Key: { username }
  }).promise();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid credentials' }) };
  }
  const token = jwt.sign({ user: { username } }, JWT_SECRET, { expiresIn: '1h' });
  return { statusCode: 200, body: JSON.stringify({ token }) };
};
