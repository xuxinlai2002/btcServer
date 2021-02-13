//app.js
const { exit } = require('process');

const fs = require('fs');
let readline = require('readline');

const getConnection = require('./db').getConnection;
const query = require('./db').query;
const releaseConnection = require('./db').releaseConnection;

const config = require('./sortTxByAddress.json');
const totalNum = config["num"];
const txPath = config["txtFile"];
const step = config["step"];

const okPath = config["okFile"];
const errPath = config["errFile"];

var startNum = 0;
var arguments = process.argv.splice(2);

let arrOK = new Array();
let arrErr = new Array();
let delArrUTXO = new Array();

if(arguments.length != 1){
    console.log("paramter err !");
    return 0;
}else{
    startNum = parseInt(arguments[0]);
}

async function main() {

    for(var z = 0 ; z < totalNum ;z ++){

       arrOK = [];
       arrErr = [];
       delArrUTXO = [];
       await getConnection();
        //insert to db
       console.time('work ' + z);
       await eachLoad(z);
       await eachSort(z);

       let fullIndex = startNum + z * step; 
       let fullTxAddressFile = okPath + "tx_addresses-" + fullIndex + ".txt"; 
       fs.writeFileSync(fullTxAddressFile,arrOK.join("\n") );
       let fullTxAddressErr = errPath + "tx_addresses-" + fullIndex + ".err"; 
       fs.writeFileSync(fullTxAddressErr, arrErr.join("\n"));

       let fullTxOutputsFile = okPath + "tx_output-" + fullIndex + ".txt"; 
       fs.writeFileSync(fullTxOutputsFile, delArrUTXO.join("\n"));

       //
       var truncateTale = "truncate txs" 
       await query(truncateTale,[]);

       truncateTale = "truncate tx_inputs" 
       await query(truncateTale,[]);
       
       console.timeEnd('work ' + z);
       await releaseConnection();
    }

};

async function eachLoad(z){

    let fullIndex = startNum + z * step;

    const loadTxsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE txs FIELDS TERMINATED BY ";" (txid, block_number,block_timestamp,is_coinbase)'
    let fullTxsFile = txPath + "txs-" + fullIndex + ".txt";    
    await query(loadTxsData,[fullTxsFile]);
    //console.log("txs-" + fullIndex + ".txt" + " " + z);
    
    const loadInputsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_inputs FIELDS TERMINATED BY ";" (txid,addresses,spend_tx_hash,spend_output_index)'
    let fullInputsFile = txPath + "inputs-" + fullIndex + ".txt";    
    await query(loadInputsData,[fullInputsFile]);
    //console.log("inputs-" + fullIndex + ".txt" + " " + z);

    const loadOutputsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_outputs FIELDS TERMINATED BY ";" (txid, output_index,addresses,value)'
    let fullOutputsFile = txPath + "outputs-" + fullIndex + ".txt";    
    await query(loadOutputsData,[fullOutputsFile]);

    console.log("txs-" + fullIndex + ".txt" + " " + z);

}


async function eachSort(z){
    
    //select from txs
    let queryTxSql = "select txid,block_number,block_timestamp from txs order by block_number,block_timestamp";
    const txs = await query(queryTxSql);
    const txCnt = txs.length;

    for(var i = 0 ;i < txCnt ; i ++){

        //case of coinbase 
        //tx = await dealCoinbase(txs[i].txid);
        if(txs[i].is_coinbase == 1){
            await dealCoinbase(txs[i].txid,txs[i].block_number,txs[i].block_timestamp);
        }else{
            await dealTx(txs[i].txid,txs[i].block_number,txs[i].block_timestamp);
        }

    }
}

async function dealCoinbase(txid,block_number,block_timestamp){
    await saveOputs(txid,block_number,block_timestamp);
}


async function dealTx(txid,block_number,block_timestamp){    
    await saveOputs(txid,block_number,block_timestamp);
    await saveInputs(txid,block_number,block_timestamp);
}

async function saveInputs(txid,block_number,block_timestamp){

    //select from txs
    let queryInputSql = "select spend_tx_hash,spend_output_index from tx_inputs where txid = ?";
    let queryInputSqlParams = [txid];

    const txInput = await query(queryInputSql,queryInputSqlParams);
    const txInputCnt = txInput.length;

    for(var i = 0 ;i < txInputCnt ; i ++){
        const retArr = await getValueFromOutputs(txInput[i].spend_tx_hash,txInput[i].spend_output_index);
        if(retArr[0] == 0 || retArr[1] == ""){
            console.log("xxl saveInputs exception ...");
        }else if(retArr[1].indexOf(",") != -1){
            console.log("input multiple addresses : tx=" + txid);

            let txAddressesAddSqlParams = [
                txid,
                retArr[1],
                -retArr[0],
                0,
                block_number,
                block_timestamp
            ];

            let  txAddressesAddSqlParamsStr = txAddressesAddSqlParams.join(";");
            arrErr.push(txAddressesAddSqlParamsStr);

        }
        else{
            // TODO
            // let txAddressesAddSql = "insert into tx_addresses(txid, address,value,isIn,block_number,block_timestamp) values (?, ?, ?, ?, ?, ?)";
            // let txAddressesAddSqlParams = [
            //     txid,
            //     retArr[1],
            //     -retArr[0],
            //     0,
            //     block_number,
            //     block_timestamp
            // ];
            // await query(txAddressesAddSql,txAddressesAddSqlParams);

            let txAddressesAddSqlParams = [
                txid,
                retArr[1],
                -retArr[0],
                0,
                block_number,
                block_timestamp
            ];

            let  txAddressesAddSqlParamsStr = txAddressesAddSqlParams.join(";");
            arrOK.push(txAddressesAddSqlParamsStr);

        }

    }

}

async function getValueFromOutputs(txid,index){

    var value = 0;
    let queryOutputSql = "select id,value,addresses from tx_outputs where txid = ? and output_index = ?";
    let queryOutputSqlParams = [txid,index];  

    const txOutput = await query(queryOutputSql,queryOutputSqlParams);
    const txOutputCnt = txOutput.length;

    if(txOutputCnt == 1){

        const utxoStr = txOutput[0].id + ";" +  txid + ";" + index + ";" + txOutput[0].addresses + ";" + txOutput[0].value
        delArrUTXO.push(utxoStr);
    
        let delOutputSql = "delete from tx_outputs where txid = ? and output_index = ?";
        await query(delOutputSql,queryOutputSqlParams);

        return [txOutput[0].value,txOutput[0].addresses];
    }else{
        console.log("exception input not found");
    }


    return [value,""];

}


async function saveOputs(txid,block_number,block_timestamp){

    //select from txs
    let queryOutputSql = "select addresses,value from tx_outputs where txid = ?";
    let queryOutputSqlParams = [txid];

    const txOutput = await query(queryOutputSql,queryOutputSqlParams);
    const txOutputCnt = txOutput.length;

    for(var i = 0 ;i < txOutputCnt ; i ++){
        
        //add multiple address exception
        if(txOutput[i].addresses.indexOf(",") != -1){
            console.log("output multiple addresses : tx=" + txid);

            let txAddressesAddSqlParams = [
                txid,
                txOutput[i].addresses,
                txOutput[i].value,
                1,
                block_number,
                block_timestamp
            ];

            let  txAddressesAddSqlParamsStr = txAddressesAddSqlParams.join(";");
            arrErr.push(txAddressesAddSqlParamsStr);
        }else{
            // TODO
            // let txAddressesAddSql = "insert into tx_addresses(txid, address,value,isIn,block_number,block_timestamp) values (?, ?, ?, ?, ?, ?)";
            // let txAddressesAddSqlParams = [
            //     txid,
            //     txOutput[i].addresses,
            //     txOutput[i].value,
            //     1,
            //     block_number,
            //     block_timestamp
            // ];
            // await query(txAddressesAddSql,txAddressesAddSqlParams);

            let txAddressesAddSqlParams = [
                txid,
                txOutput[i].addresses,
                txOutput[i].value,
                1,
                block_number,
                block_timestamp
            ];

            let  txAddressesAddSqlParamsStr = txAddressesAddSqlParams.join(";");
            arrOK.push(txAddressesAddSqlParamsStr);

        }


    }

}
  
main().then(() => {
    console.log("OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  