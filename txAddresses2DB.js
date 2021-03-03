//app.js
const fs = require('fs');

const { exit } = require('process');
let readline = require('readline');

const getConnection = require('./db').getConnection;
const query = require('./db').query;
const releaseConnection = require('./db').releaseConnection;


const prefixInteger = require("./heler").prefixInteger;

const config = require('./config.json');
const okFile = config["okFile"];
const step = config["step"];
var startNum = 0;
const totalNum = config["num"];
const subNum = config["subNum"];
var isRset = 0;

var arguments = process.argv.splice(2);
if(arguments.length != 2){
    console.log("paramter err !");
    return 0;
}else{
    startNum = parseInt(arguments[0]);
    isRset = parseInt(arguments[1]);
}


async function txAddresses2DB(){
    
  await getConnection();

  if(isRset == 1){
    await query("truncate tx_addresses",[]);
  }
  await query("truncate address_balance",[]);


  var fromNum = startNum;
  for(var z = 0 ; z < totalNum ;z ++){

    var toNum = fromNum + step - 1;
    console.log(fromNum + " : " + toNum);

    const loadTxsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_addresses FIELDS TERMINATED BY ";" (txid,address,value,isIn,block_number,block_timestamp)'
    let fullTxsFile = okFile + fromNum + "-" + toNum + "-" + "tx_address"  + ".txt";    
    
    //console.log(fullTxsFile);
    await query(loadTxsData,[fullTxsFile]);
    fromNum = fromNum + step
    //console.log(fullTxsFile + " " + z);

  }


  for(var i = 0 ;i < subNum ;i ++){


    var endNum = startNum + totalNum * step -1;
    const loadAddrData = 'LOAD DATA LOCAL INFILE ? INTO TABLE address_balance FIELDS TERMINATED BY ";" (address,value)'
    let fullAddressTxsFile = okFile + "sum-" + startNum + "-" + endNum + "-2-" + "addr2Bal-" + prefixInteger(i,5)  + ".txt";    
    
    //console.log(fullAddressTxsFile);

    await query(loadAddrData,[fullAddressTxsFile]);
    //console.log(fullTxsFile + " " + z);

  }

  await releaseConnection();












}

txAddresses2DB().then(() => {
    console.log("finish ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

});
