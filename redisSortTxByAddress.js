//app.js
const { exit } = require('process');
var processLine = require('child_process');
let readline = require('readline');

//fs
const fs = require('fs');

//redis
const getRedis = require('./redis').get
const delRedis = require('./redis').del

//config
const config = require('./config.json');
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
let delKeys = new Array();

if(arguments.length != 1){
    console.log("paramter err !");
    return 0;
}else{
    startNum = parseInt(arguments[0]);
}

let arr = new Array();

function readEachData2Arr(filePath){

    // 返回一个 Promise
    return new Promise(( resolve, reject ) => {
  
        arr = [];
        let fRead = fs.createReadStream(filePath);
        let objReadline = readline.createInterface({
            input: fRead
        });
       
        objReadline.on('line', line => {
            arr.push(line);
            
        });
        objReadline.on('close', () => {
            resolve();
        });
    });
  
};

async function main() {

    var cmd = ""
    console.time('total ');
    for(var z = 0 ; z < totalNum ;z ++){

       console.time('work ' + z);
        //init param
       arrOK = [];
       arrErr = [];
       delKeys = [];

       //await getConnection();
       await eachLoad(z);
       await eachSort(z);
       
       let fullIndex = startNum + z * step; 
       let fullTxAddressFile = okPath + "tx_addresses-" + fullIndex + ".txt"; 
       fs.writeFileSync(fullTxAddressFile,arrOK.join("\n") );


       if(arrErr.length > 0){
            let fullTxAddressErr = errPath + "tx_addresses-" + fullIndex + ".err"; 
            fs.writeFileSync(fullTxAddressErr, arrErr.join("\n"));
       }
       
       console.timeEnd('work ' + z);

       //del used utxo
       if(delKeys.length > 0){
            await delRedis(delKeys);
       }
       

       //del input 
       cmd = "redis-cli keys 'i*' | xargs redis-cli del"
       processLine.execSync(cmd, [], { encoding : 'utf8' });

       console.log("---------------------------------\n");
    }
    
    // endNum =  startNum + totalNum * step - 1
    // idxPath = okPath + "idx-" + endNum + ".txt"
    // cmd = "redis-dump > " +  idxPath
    // processLine.execSync(cmd, [], { encoding : 'utf8' });

    console.timeEnd('total ');
};

async function eachLoad(z){

    //redis out
    const idxNo = startNum + z*step 
    const redisOutPath = redisPath + "out-" + idxNo + ".txt";
    var cmd = "cat " + redisOutPath + " | redis-cli --pipe"
    processLine.execSync(cmd, [], { encoding : 'utf8' });

    //redis in
    const redisInPath = redisPath + "in-" + idxNo + ".txt";
    cmd = "cat " + redisInPath + " | redis-cli --pipe"
    processLine.execSync(cmd, [], { encoding : 'utf8' });

    console.log("redis over " );

}

async function eachSort(z){
    
    let fullIndex = startNum + z * step;
    let fullTxsFile = txPath + "txs-" + fullIndex + ".txt";  

    await readEachData2Arr(fullTxsFile);
    const txCnt = arr.length;

    console.log("outputs-" + fullIndex + ".txt" + " : " + txCnt);
    for(var i = 0 ;i < txCnt ; i ++){
        
        var txsArr = getL2Data(arr[i]);
        if(txsArr.length != 4){
            console.log("txs file data error lineNo :" + i);
        }else{
            if(txsArr[3].is_coinbase == 1){
                await dealCoinbase(txsArr[0],txsArr[1],txsArr[2],1);
            }else{
                await dealTx(txsArr[0],txsArr[1],txsArr[2],0);
            }
        }
    }

    arr = [];

}

async function dealCoinbase(txid,block_number,block_timestamp,is_coinbase){
    await saveOputs(txid,block_number,block_timestamp,is_coinbase);
}


async function dealTx(txid,block_number,block_timestamp,is_coinbase){    
    await saveOputs(txid,block_number,block_timestamp,is_coinbase);
    await saveInputs(txid,block_number,block_timestamp);
}

async function saveInputs(txid,block_number,block_timestamp){

    let inputKey = "i" + getBaseKey(txid);
    const val = await getRedis(inputKey);
    if(val != null){

        const arrL1Val = getL1Data(val);
        let txInputCnt = arrL1Val.length;
        for(var i = 0 ;i < txInputCnt ; i ++){
            const arrL2Val = getL2Data(arrL1Val[i]);
    
            const retVal = await getValueFromOutputs(arrL2Val[1],arrL2Val[2]);
            if(retVal == ""){
                return
            }
            getEachOutputFromValue(txid,block_number,block_timestamp,0,retVal);
        }
    }
}

async function getValueFromOutputs(txid,index){


    //
    const baseKey = getBaseKey(txid);
    val = await getRedis(baseKey + index);
    if(val == null){
        console.log("input not found " + baseKey + " : " + index);
        return ""
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

function getEachOutputFromValue(txid,block_number,block_timestamp,isIn,val){

    const retArr = getL2Data(val);

    if(retArr.length != 2){
        console.log("redis data error :" + val);
        return;
    }

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

function getBaseKey(txid){
    return txid.substr(0,15);
}

function getL1Data(val){
    return val.split("-");
}

function getL2Data(val){
    return val.split(";");
}

  
main().then(() => {
    //console.log("OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  