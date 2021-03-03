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

function hget(key,field) {

  return new Promise((resovle, reject) => {

      client.hget(key,field,(err, reply) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resovle(reply);
    });

  });
}


function hset(key,field,val) {
  return new Promise((resovle, reject) => {
      client.hset(key,field,val,(err, reply) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resovle(reply);
    });
  });
}


function hdel(key,field) {
  return new Promise((resovle, reject) => {
      client.hdel(key,field,(err, reply) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resovle(reply);
    });
  });
}

function hexists(key) {
  return new Promise((resovle, reject) => {
      client.hexists(key,field,(err, reply) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resovle(reply);
    });
  });
}

function hlen(key) {
  return new Promise((resovle, reject) => {
      client.hlen(key,(err, reply) => {
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

module.exports.hget =  hget
module.exports.hset =  hset
module.exports.hdel =  hdel
module.exports.hlen =  hlen
module.exports.hexists =  hexists