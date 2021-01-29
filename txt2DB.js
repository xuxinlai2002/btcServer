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
    
    const loadInputsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_inputs FIELDS TERMINATED BY ";" (txid,addresses,spend_tx_hash,spend_output_index)'
    let fullInputsFile = config["txtFile"] + "inputs-" + fullIndex + ".txt";    
    await query(loadInputsData,[fullInputsFile]);

    const loadOutputsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_outputs FIELDS TERMINATED BY ";" (txid, output_index,addresses,value)'
    let fullOutputsFile = config["txtFile"] + "outputs-" + fullIndex + ".txt";    
    await query(loadOutputsData,[fullOutputsFile]);
    
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















// function readEachJson2Arr(filePath){

//     // 返回一个 Promise
//     return new Promise(( resolve, reject ) => {
  
//         arr = [];
//         let fRead = fs.createReadStream(filePath);
//         let objReadline = readline.createInterface({
//             input: fRead
//         });
       
//         objReadline.on('line', line => {
//             arr.push(line);
            
//         });
//         objReadline.on('close', () => {
//             //callback(arr);
//             //reject();
//             resolve();
//         });
//     });
  
// };

// async function readEachJson2DB(){

//     await getConnection();
//     const totalCnt = arr.length;

//     for(var i = 0 ;i < totalCnt  ;i ++){

//         const txJson = JSON.parse(arr[i]);
//         const is_coinbase = txJson["is_coinbase"] ? 1:0;

//         //insert into txs
//         let txAddSql = "insert into txs(txid,block_number,block_timestamp,is_coinbase) values(?, ?, ?,?)";
//         let txAddSqlParams = [txJson["hash"],txJson["block_number"],txJson["block_timestamp"],is_coinbase];

//         await query(txAddSql,txAddSqlParams);

//         //insert into tx_inputs TODO ....
//         const txInputsJsons = txJson["inputs"];
//         //console.log(txInputsJsons);
//         for(var j = 0 ; j < txInputsJsons.length ; j ++ ){

//             const txInputsJson = txInputsJsons[j];
//             const addresses = txInputsJson["addresses"].join(',');
//             let txInputsAddSql = "insert into tx_inputs(txid, addresses,spend_tx_hash,spend_output_index) values (?, ?, ?, ?)";
//             let txInputsAddSqlParams = [txJson["hash"],addresses,txInputsJson["spent_transaction_hash"],txInputsJson["spent_output_index"]];
//             await query(txInputsAddSql,txInputsAddSqlParams);

//         }

//         //insert into tx_inputs
//         const txOutputsJsons = txJson["outputs"];
//         for(var j = 0 ; j < txOutputsJsons.length ; j ++ ){

//             const txOutputsJson = txOutputsJsons[j];
//             const value = txOutputsJson["value"];

//             if(value > 0){
//                 const addresses = txOutputsJson["addresses"].join(',');
//                 let txOutputsAddSql = "insert into tx_outputs(txid,output_index,addresses,value) values (?, ?, ?, ?)";
//                 let txOutputsAddSqlParams = [txJson["hash"],txOutputsJson["index"],addresses,txOutputsJson["value"]];

//                 await query(txOutputsAddSql,txOutputsAddSqlParams);
//             }
//         }

//     }

//     await releaseConnection();
//     arr = [];
// }

// async function readJson2DB(){

//     for(var z = 0 ; z < totalNum ;z ++){

//         let fullIndex = startNum + z * step;
//         let fullFileName = txPath + "transactions-" + fullIndex + ".json";

        
//         await readEachJson2Arr(fullFileName);
//         console.log("transactions-" + fullIndex + ".json" + " : " + arr.length);
//         //console.log(arr.length);
//         await readEachJson2DB();
        

//     }

// }

// readJson2DB().then(() => {
//     console.log("finish ...");
//     exit(0);
//   }).catch((e) => {
//     console.log("error", e.message);

//   });