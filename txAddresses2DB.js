//app.js
const fs = require('fs');

const { exit } = require('process');
let readline = require('readline');

const getConnection = require('./db').getConnection;
const query = require('./db').query;
const releaseConnection = require('./db').releaseConnection;

const config = require('./txAddresses2DB.json');
const okFile = config["okFile"];
const step = config["step"];
var startNum = 0;
const totalNum = config["num"];

var arguments = process.argv.splice(2);
if(arguments.length != 1){
    console.log("paramter err !");
    return 0;
}else{
    startNum = parseInt(arguments[0]);
}


async function txAddresses2DB(){
    
  await getConnection();
  for(var z = 0 ; z < totalNum ;z ++){

    let fullIndex = startNum + z * step;

    const loadTxsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_addresses FIELDS TERMINATED BY ";" (txid,address,value,isIn,block_number,block_timestamp)'
    let fullTxsFile = okFile + "tx_addresses-" + fullIndex + ".txt";    
    await query(loadTxsData,[fullTxsFile]);
    console.log(fullTxsFile + " " + z);
    

  }
  await releaseConnection();

}

txAddresses2DB().then(() => {
    console.log("finish ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

});
