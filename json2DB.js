//app.js
const fs = require('fs');
const { exit } = require('process');
let readline = require('readline');
const config = require('./config.json');
const query = require('./db');

function readFileToArr(fReadName, callback) {
    let fRead = fs.createReadStream(fReadName);
    let objReadline = readline.createInterface({
        input: fRead
    });
    let arr = new Array();
    objReadline.on('line', line => {
        arr.push(line);
    });
    objReadline.on('close', () => {
        callback(arr);
    });
}

//
readFileToArr(config["txPath"], async arr=>{
    

    for(var i = 0 ;i < arr.length ;i ++){

        //console.log(i);
        //console.log(arr[0]);
        const txJson = JSON.parse(arr[i]);
        const is_coinbase = txJson["is_coinbase"] ? 1:0;

        //insert into txs
        let txAddSql = "insert into txs(txid,block_number,block_timestamp,is_coinbase) values(?, ?, ?,?)";
        let txAddSqlParams = [txJson["hash"],txJson["block_number"],txJson["block_timestamp"],is_coinbase];
        await query(txAddSql,txAddSqlParams);

        //insert into tx_inputs TODO ....
        const txInputsJsons = txJson["inputs"];
        //console.log(txInputsJsons);
        for(var j = 0 ; j < txInputsJsons.length ; j ++ ){

            const txInputsJson = txInputsJsons[j];
            const addresses = txInputsJson["addresses"].join(',');
            let txInputsAddSql = "insert into tx_inputs(txid, addresses,spend_tx_hash,spend_output_index) values (?, ?, ?, ?)";
            let txInputsAddSqlParams = [txJson["hash"],addresses,txInputsJson["spent_transaction_hash"],txInputsJson["spent_output_index"]];
            await query(txInputsAddSql,txInputsAddSqlParams);

        }

        //insert into tx_inputs
        const txOutputsJsons = txJson["outputs"];
        for(var j = 0 ; j < txOutputsJsons.length ; j ++ ){

            const txOutputsJson = txOutputsJsons[j];
            const value = txOutputsJson["value"];

            if(value > 0){
                const addresses = txOutputsJson["addresses"].join(',');
                let txOutputsAddSql = "insert into tx_outputs(txid,output_index,addresses,value) values (?, ?, ?, ?)";
                let txOutputsAddSqlParams = [txJson["hash"],txOutputsJson["index"],addresses,txOutputsJson["value"]];

                await query(txOutputsAddSql,txOutputsAddSqlParams);
            }
        }
    }

    console.log("OK");
    exit(0);

});