const mysql = require('mysql')
const config = require('./db.json');

const pool = mysql.createPool({
  host     :  config["host"],
  user     :  config["user"],
  password :  config["password"],
  database :  config["database"]
})

var myConnection = null;

let getConnection = function() {

  // 返回一个 Promise
  return new Promise(( resolve, reject ) => {

    pool.getConnection(function(err, connection) {

      if (err) {
        reject( err )
      } else {
        myConnection = connection;
        resolve();
      };

    });
  });
};

// 接收一个sql语句 以及所需的values
// 这里接收第二参数values的原因是可以使用mysql的占位符 '?'
// 比如 query(`select * from my_database where id = ?`, [1])
let query = function( sql, values ) {

  // 返回一个 Promise
  return new Promise(( resolve, reject ) => {

    myConnection.query(sql, values, ( err, rows) => {

      if ( err ) {
        console.log("error");
        reject( err )
      } else {
        resolve( rows )
      }
    })

  })

}

let releaseConnection = function() {
   // 返回一个 Promise
   return new Promise(( resolve, reject ) => {
    
    myConnection.release();
    resolve();

   })
}
module.exports.getConnection =  getConnection
module.exports.releaseConnection =  releaseConnection
module.exports.query =  query