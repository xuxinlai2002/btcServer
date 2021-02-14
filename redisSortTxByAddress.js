//app.js
const { exit } = require('process');
var processLine = require('child_process');

//fs
const fs = require('fs');

//db
const getConnection = require('./db').getConnection;
const query = require('./db').query;
const releaseConnection = require('./db').releaseConnection;

//redis
const getRedis = require('./redis').get
const delRedis = require('./redis').del

//config
const config = require('./redisSortTxByAddress.json');
const redisPath = config["redisPath"];
const totalNum = config["num"];
const step = config["step"];
const txPath = config["txtFile"];
const okPath = config["okFile"];
const errPath = config["errFile"];

//init param
var startNum = 0;
var arguments = process.argv.splice(2);
let arrOK = new Array();
let arrErr = new Array();
let delArrUTXO = new Array();
let delKeys = new Array();

if(arguments.length != 1){
    console.log("paramter err !");
    return 0;
}else{
    startNum = parseInt(arguments[0]);
}

async function main() {

    console.time('total ');
    for(var z = 0 ; z < totalNum ;z ++){

       console.time('work ' + z);
        //init param
       arrOK = [];
       arrErr = [];
       delArrUTXO = [];
       delKeys = [];

       await getConnection();
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

       await delRedis(delKeys);
    }

    console.timeEnd('total ');
};

async function eachLoad(z){

    let fullIndex = startNum + z * step;

    const loadTxsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE txs FIELDS TERMINATED BY ";" (txid, block_number,block_timestamp,is_coinbase)'
    let fullTxsFile = txPath + "txs-" + fullIndex + ".txt";    
    await query(loadTxsData,[fullTxsFile]);
    
    const loadInputsData = 'LOAD DATA LOCAL INFILE ? INTO TABLE tx_inputs FIELDS TERMINATED BY ";" (txid,addresses,spend_tx_hash,spend_output_index)'
    let fullInputsFile = txPath + "inputs-" + fullIndex + ".txt";    
    await query(loadInputsData,[fullInputsFile]);
    console.log("txs-" + fullIndex + ".txt" + " " + z);

    await loadRedis(z);

}

async function loadRedis(z){

    const fullRedisPath = redisPath + "out-" + z*step + ".txt";
    const cmd = "cat " + fullRedisPath + " | redis-cli --pipe"
    
    var cmdRet = processLine.execSync(cmd, [], { encoding : 'utf8' });
    console.log(cmdRet.toString().replace(/(^\s*)|(\s*$)/g, ""));    

}

async function eachSort(z){
    
    //select from txs
    //let queryTxSql = "select txid,block_number,block_timestamp,is_coinbase from txs order by block_number,block_timestamp";
    let queryTxSql = "select txid,block_number,block_timestamp,is_coinbase from txs order by block_number,block_timestamp,id";
    const txs = await query(queryTxSql);
    const txCnt = txs.length;

    for(var i = 0 ;i < txCnt ; i ++){

        if(txs[i].is_coinbase == 1){
            await dealCoinbase(txs[i].txid,txs[i].block_number,txs[i].block_timestamp,1);
        }else{
            await dealTx(txs[i].txid,txs[i].block_number,txs[i].block_timestamp,0);
        }
    }
}

async function dealCoinbase(txid,block_number,block_timestamp,is_coinbase){
    await saveOputs(txid,block_number,block_timestamp,is_coinbase);
}


async function dealTx(txid,block_number,block_timestamp,is_coinbase){    
    await saveOputs(txid,block_number,block_timestamp,is_coinbase);
    await saveInputs(txid,block_number,block_timestamp);
}

async function saveInputs(txid,block_number,block_timestamp){

    let queryInputSql = "select spend_tx_hash,spend_output_index from tx_inputs where txid = ?";
    let queryInputSqlParams = [txid];

    const txInput = await query(queryInputSql,queryInputSqlParams);
    const txInputCnt = txInput.length;

    for(var i = 0 ;i < txInputCnt ; i ++){
        const retVal = await getValueFromOutputs(txInput[i].spend_tx_hash,txInput[i].spend_output_index);
        getEachOutputFromValue(txid,block_number,block_timestamp,0,retVal);
    }
}

async function getValueFromOutputs(txid,index){

    //
    const baseKey = getBaseKey(txid);
    val = await getRedis(baseKey + index);
    if(val == null){
        console.log("error input not found" + baseKey + " : " + index);
    }
    //
    //await delRedis(baseKey + index);
    delKeys.push(baseKey + index);

    return val;
}


async function saveOputs(txid,block_number,block_timestamp,is_coinbase){

    //to Redis
    const baseKey = getBaseKey(txid);
    var subKey = 0;
    var val = "";

    if(is_coinbase == 1){
        val = await getRedis(baseKey + subKey);
        getEachOutputFromValue(txid,block_number,block_timestamp,1,val);
    }else{
        var isLoop = true
        do{
            val = await getRedis(baseKey + subKey);
            if(val == null){
                isLoop = false
            }else{
                getEachOutputFromValue(txid,block_number,block_timestamp,1,val);
                subKey ++ 
            }
        }while(isLoop)

    }

}

function getBaseKey(txid){
    return txid.substr(0,15);
}


function getEachOutputFromValue(txid,block_number,block_timestamp,isIn,val){

    const retArr = val.split(";");

    if(retArr.length != 2){
        console.log("redis data error :" + val);
        return;
    }
    //just for test
    //const addresses = retArr[0].repalce(/n/,"nonstandard");
    const addresses = retArr[0]
    const value = isIn? retArr[1]: -retArr[1];

    let txAddressesAddParams = [
        txid,
        addresses,
        value,
        isIn,
        block_number,
        block_timestamp
    ];

    let  txAddressesAddParamsStr = txAddressesAddParams.join(";");

    //add multiple address exception
    if(addresses.indexOf(",") != -1){
        console.log("output multiple addresses : tx=" + txid);
        arrErr.push(txAddressesAddParamsStr);
    }else{
        arrOK.push(txAddressesAddParamsStr);
    }

}
  
main().then(() => {
    console.log("OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  