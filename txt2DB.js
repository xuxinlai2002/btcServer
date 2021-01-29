//app.js
const fs = require('fs');
const { exit } = require('process');
let readline = require('readline');
const config = require('./config.json');
const getConnection = require('./db').getConnection;
const query = require('./db').query;
const releaseConnection = require('./db').releaseConnection;
const txPath = config["txPath"];
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

////

async function txt2DB(){
    
  await getConnection();
  for(var z = 0 ; z < totalNum ;z ++){

    let fullIndex = startNum + z * step;

    const loadTxsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE txs FIELDS TERMINATED BY ";" (txid, block_number,block_timestamp,is_coinbase)'
    let fullTxsFile = config["txtFile"] + "txs-" + fullIndex + ".txt";    
    await query(loadTxsData,[fullTxsFile]);
    console.log(fullTxsFile + " " + z);
    
    const loadInputsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_inputs FIELDS TERMINATED BY ";" (txid,addresses,spend_tx_hash,spend_output_index)'
    let fullInputsFile = config["txtFile"] + "inputs-" + fullIndex + ".txt";    
    await query(loadInputsData,[fullInputsFile]);
    console.log(fullInputsFile + " " + z);

    const loadOutputsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_outputs FIELDS TERMINATED BY ";" (txid, output_index,addresses,value)'
    let fullOutputsFile = config["txtFile"] + "outputs-" + fullIndex + ".txt";    
    await query(loadOutputsData,[fullOutputsFile]);
    console.log(fullOutputsFile + " " + z);

  }
  await releaseConnection();

}


let arr = new Array();

txt2DB().then(() => {
    console.log("finish ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

});
