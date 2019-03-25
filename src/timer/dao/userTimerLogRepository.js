
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

class UserTimerLogRepository {

  constructor(options) {
    options = options || {};
    this._dynamodb = options.dynamodb || new AWS.DynamoDB();
    this._userTimerLogTableName = options.userTimerLogTableName || process.env.userTimerLogTableName;
  }

  findByUserTimer(options) {
    options = options || {};
    let { userId, timerId, pageSize, after } = options;
    pageSize = pageSize || 100;
    // TODO: Refactor to use logger.js
    console.info('UserTimerLogRepository.findByUserTimer(userId, timerId)', userId, timerId);
    return new Promise((resolve, reject) => {
      this._dynamodb.query({
        TableName: this._userTimerLogTableName,
        KeyConditionExpression: 'userTimerId = :userTimerId',
        ExpressionAttributeValues: {
          ':userTimerId': { S: `${userId};${timerId}` }
        },
        Limit: pageSize,
        ExclusiveStartKey: after
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  save(userTimerLog) {
    // TODO: Refactor to use logger.js
    console.info(
      'UserTimerLogRepository.save(usertimerId, time)',
      userTimerLog.userTimerId.S,
      userTimerLog.time.S);
    return new Promise((resolve, reject) => {
      this._dynamodb.putItem({
        TableName: this._userTimerLogTableName,
        Item: userTimerLog,
        ReturnConsumedCapacity: 'TOTAL'
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  delete(userId, timerId, time) {
    // TODO: Refactor to use logger.js
    console.info(
      'UserTimerLogRepository.delete(userId, timerId, time)',
      userId,
      timerId,
      time);
    return new Promise((resolve, reject) => {
      this._dynamodb.deleteItem({
        TableName: this._userTimerLogTableName,
        Key: {
          userTimerId: { S: `${userId};${timerId}` },
          time: { S: time }
        }
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

}

// export singleton
const singleton = new UserTimerLogRepository();
singleton.UserTimerLogRepository = UserTimerLogRepository;
module.exports = singleton;
