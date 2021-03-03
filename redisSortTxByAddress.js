//app.js
const { exit } = require('process');
var processLine = require('child_process');
let readline = require('readline');

//fs
const fs = require('fs');

//redis
const getRedis = require('./redis').get
const delRedis = require('./redis').del

const hgetRedis = require('./redis').hget
const hsetRedis = require('./redis').hset
const hdelRedis = require('./redis').hdel
const hexistsRedis = require('./redis').hexists
const hlenRedis = require('./redis').hlen

//config
const config = require('./config.json');
const redisPath = config["redisPath"];
const totalNum = config["num"];
const step = config["step"];
const txPath = config["txtFile"];
const okPath = config["okFile"];
const errPath = config["errFile"];

//----
const en = require('int-encoder');
const encodeTx = require("./heler").encodeTx;
const encodeInt = require("./heler").encodeInt;
const decodeInt = require("./heler").decodeInt;
const getTx2AddressFullPath = require("./heler").getTx2AddressFullPath;

//init param
var startNum = 0;
var arguments = process.argv.splice(2);
let arrOK = new Array();
let arrSum = new Array();
let arrErr = new Array();
let delKeys = new Array();

var curDeTx = "";
var curInTx = "";
var curDeValue = 0;
var curInValue = "";
var curDeSubkey = 0;
var curInSubKey = "";

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


    console.time('total ');
    var fromNum = startNum;
    for(var z = 0 ; z < totalNum ;z ++){

       console.time('work ' + z);
        //init param
       arrOK = [];
       arrErr = [];
       delKeys = [];

       //await getConnection();
       await eachLoad(z);
       await eachSort(z);
       
      
       //let fullTxAddressFile = okPath + fullIndex + "-tx_addresses" + ".txt"; 
       let fullTxAddressFile = getTx2AddressFullPath(fromNum);
       fs.writeFileSync(fullTxAddressFile,arrOK.join("\n") );
       fromNum = fromNum +  step; 

       if(arrErr.length > 0){
            let fullIndex = startNum + z * step; 
            let fullTxAddressErr = errPath + fullIndex + "-tx_addresses" + ".err"; 
            fs.writeFileSync(fullTxAddressErr, arrErr.join("\n"));
       }

    //    let fullAddressBalanceFile = okPath + fullIndex + "-address_balance" + ".txt"; 
    //    fs.writeFileSync(fullAddressBalanceFile,arrSum.join("\n") );       
       console.timeEnd('work ' + z);

       //del used utxo
       if(delKeys.length > 0){
            await hdelRedis("out",delKeys);
       }
       
       await delRedis("in");

       //del input 
       //cmd = "redis-cli keys 'i*' | xargs redis-cli del"
       //processLine.execSync(cmd, [], { encoding : 'utf8' });
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
    const idxNo = startNum + z * step
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

    console.log("txs-" + fullIndex + ".txt" + " : " + txCnt);
    for(var i = 0 ;i < txCnt ; i ++){


//console.log("--------------" + i);
//console.log(arr[i]);

        var txsArr = getL2Data(arr[i]);
//console.log(txsArr);
        
        if(txsArr.length != 4){
            console.log("txs file data error lineNo :" + i);
        }else{
            //deal with compress
//console.log(txsArr[0]);
            curDeTx = txsArr[0];
            var encodedTx = encodeTx(txsArr[0]);
            curInTx = encodedTx;

            if(txsArr[3] == '1'){
// console.log(encodedTx);
// console.log(txsArr[1]);
// console.log(txsArr[2]);
                await dealCoinbase(encodedTx,txsArr[1],txsArr[2],1);
            }else{
                await dealTx(encodedTx,txsArr[1],txsArr[2],0);
            }
        }

//exit(0);    
    }

    arr = [];

}


async function dealCoinbase(encodedTx,block_number,block_timestamp,is_coinbase){
    await saveOputs(encodedTx,block_number,block_timestamp,is_coinbase);
}


async function dealTx(encodedTx,block_number,block_timestamp,is_coinbase){    
    await saveOputs(encodedTx,block_number,block_timestamp,is_coinbase);
    await saveInputs(encodedTx,block_number,block_timestamp);
}

async function saveInputs(encodedTx,block_number,block_timestamp){

    //let inputKey = "i" + getBaseKey(txid);
    //const val = await getRedis(inputKey);

    const val = await hgetRedis("in",encodedTx);
    if(val != null){

        const arrL1Val = getL1Data(val);
        let txInputCnt = arrL1Val.length;
        for(var i = 0 ;i < txInputCnt ; i ++){
            const arrL2Val = getL2Data(arrL1Val[i]);
            const retVal = await getValueFromOutputs(arrL2Val[0],arrL2Val[1]);
            if(retVal == ""){
                return
            }
            await getEachOutputFromValue(curDeTx,block_number,block_timestamp,0,retVal);
        }
    }
}

async function getValueFromOutputs(encodedTx,inSubKey){

    //
    // const baseKey = getBaseKey(txid);
    // val = await getRedis(baseKey + index);

    var findKey = encodedTx + inSubKey
    val = await hgetRedis("out",findKey);
    if(val == null){
        console.log("input not found " + findKey);
        return ""
    }
    //
    //await delRedis(baseKey + index);
    delKeys.push(findKey);

    return val;

}


async function saveOputs(encodedTx,block_number,block_timestamp,is_coinbase){

    //to Redis
    var subKey = 0;
    var val = "";

//     if(is_coinbase == 1){
//         curInSubKey = Number(subKey).toString(16);
//         val = await hgetRedis("out",encodedTx + curInSubKey);
//         await getEachOutputFromValue(curDeTx,block_number,block_timestamp,1,val);
//     }else{
//         var isLoop = true
//         do{
//             curInSubKey = Number(subKey).toString(16);
//             val = await hgetRedis("out",encodedTx + curInSubKey);
//             if(val == null){
//                 isLoop = false
//             }else{

// // if(val.indexOf("1AbHNFdKJeVL8FRZyRZoiTzG9VCmzLrtvm") != -1){

// //     arrData = val.split(";")
// //     console.log(curDeTx + ":" + block_number + ":" + en.decode(arrData[1],10) + ":" + arrData[0]);
// //     //console.log();
// // }                
//                 await getEachOutputFromValue(curDeTx,block_number,block_timestamp,1,val);
//                 subKey ++ 
//             }
//         }while(isLoop)

//     }

    var isLoop = true
    do{
        curInSubKey = Number(subKey).toString(16);
        val = await hgetRedis("out",encodedTx + curInSubKey);
        if(val == null){
            if(subKey != 0){
                isLoop = false
            }else{
                subKey ++ 
            }
        }else{
            await getEachOutputFromValue(curDeTx,block_number,block_timestamp,1,val);
            subKey ++ 
        }
    }while(isLoop)


}

async function getEachOutputFromValue(curDeTx,block_number,block_timestamp,isIn,val){

    const retArr = getL2Data(val);

    if(retArr.length != 2){
        console.log("redis data error :" + val);
        return;
    }

    const addresses = retArr[0]

    curDeValue = decodeInt(retArr[1])
    curDeValue = isIn? curDeValue: -curDeValue;

    const value = isIn? retArr[1]: "!" + retArr[1];
    curInValue = value;

    let txAddressesAddParams = [
        curDeTx,
        addresses,
        curDeValue,
        isIn,
        block_number,
        block_timestamp
    ];


// if(isIn == 0){
//     console.log(val);
//     console.log(txAddressesAddParams);
//     exit(0);
// }


    let  txAddressesAddParamsStr = txAddressesAddParams.join(";");

    //add multiple address exception
    if(addresses.indexOf(",") != -1){
        console.log("output multiple addresses : tx=" + curDeTx);
        arrErr.push(txAddressesAddParamsStr);
    }else{    
        arrOK.push(txAddressesAddParamsStr);
        await setSum(txAddressesAddParams);
    }

}

//
var testNUm = 0;
async function setSum(txAddressesAddParams){

// console.log("come to sum 2");
// console.log(txAddressesAddParams[1]);

   //Stop here
   var retVal =  await hgetRedis("addr2Bal",txAddressesAddParams[1]);

// console.log(retVal);    
// console.log("hgetRedis end"); 

   var encodedHlen = ""
   var val = ""

   var hlenDe = 0
   var sumDecodedValue = 0


// console.log(retVal)
   if(retVal == null){

        val = curInValue

   }else{
        //retVal = await hgetRedis("addr2Bal",txAddressesAddParams[1]);
        // encodedHlen = getL2Data(retVal)[0];
        // hlenDe = decodeInt(encodedHlen);
        // encodedValue = getL2Data(retVal)[1];
        // sumDecodedValue = decodeInt(encodedValue) + curDeValue;
        // sumIncodeValue = encodeInt(sumDecodedValue);
        // val = encodedHlen + ";" + sumIncodeValue

        sumDecodedValue = decodeInt(retVal) + curDeValue;
        
        // if(txAddressesAddParams[1] == "1Eym7pyJcaambv8FG4ZoU8A4xsiL9us2zz"){

        //     //console.log("------------0");
        //     console.log(retVal + ":" + decodeInt(retVal) + ":" + curDeValue + ":" + sumDecodedValue);
        //     // console.log(decodeInt(retVal));
        //     // console.log(curDeValue);
        //     console.log("------------" + (testNUm ++) );
        // }

        if(sumDecodedValue < 0){
            sumIncodeValue = "!" + encodeInt(-sumDecodedValue);
        }else{
            sumIncodeValue = encodeInt(sumDecodedValue);
        }
        val = sumIncodeValue

   }

   //if(val != 'a'){ //not = 0
   await hsetRedis("addr2Bal",txAddressesAddParams[1],val);
   //}
   
//   await hsetRedis("out",curInTx + curInSubKey,encodedHlen + ";" + encodeInt(curDeValue));

// console.log("end sum");
// console.log(curInTx + curInSubKey);
// console.log(encodedHlen + ";" + encodeInt(curDeValue));
//    exit(0);
  
}

function getL1Data(val){
    return val.split(":");
}

function getL2Data(val){
    return val.split(";");
}

  
main().then(() => {
    console.log("OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  