var redis = require('redis');
const config = require('./redis.json');

host = config["host"]
port = config["port"]
password = config["password"]
var client = redis.createClient(port, host);

if(password != ""){
    client.auth(password);  // 如果没有设置密码 是不需要这一步的
}

function get(key) {
    return new Promise((resovle, reject) => {
        client.get(key, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resovle(reply);
      });
    });
}

function keys(key) {
    return new Promise((resovle, reject) => {
        client.keys(key, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resovle(reply);
      });
    });
}

function del(key) {
    return new Promise((resovle, reject) => {
        client.del(key, (err, reply) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resovle(reply);
      });
    });
}

module.exports.get =  get
module.exports.del =  del
module.exports.keys =  keys