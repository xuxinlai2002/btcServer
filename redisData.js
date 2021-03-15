//app.js
const fs = require('fs');
let readline = require('readline');

const { exit } = require('process');

const config = require('./config.json');
const txtPath = config["txtFile"];
const redisPath = config["redisPath"];
const step = config["step"];
var startNum = 0;
const totalNum = config["num"];

var en = require('int-encoder');
var encodeTx = require("./heler").encodeTx;
var encodeInt = require("./heler").encodeInt;

var arguments = process.argv.splice(2);
if(arguments.length != 1){
    console.log("paramter err !");
    return 0;
}else{
    startNum = parseInt(arguments[0]);
}

let arr = new Array();
var out = [];

function readEachTxt2Arr(filePath){

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

async function readEachOuput2Redis(outFile){

    const totalCnt = arr.length;
    out = [];

    for(var i = 0 ;i < totalCnt  ; i ++){

        let outArr = arr[i].split(";")
        
        let baseKey = encodeTx(outArr[0]);
        let subKey =  Number(outArr[1]).toString(16);
        let outKey = baseKey  + subKey

        var address = outArr[2]
        if(address.indexOf("nonstandard") != -1){
            address = "n" + en.encode(address.replace(/nonstandard/,""),16);
        }

        let outVal = address + ";" + encodeInt(outArr[3]);
        setKeyVal("out",outKey,outVal);
    }
    
    fs.writeFileSync(outFile,out.join("\n") );
}

async function readEachInput2Redis(outFile){

    const totalCnt = arr.length;
    var resultVal = "";
    out = [];

    var eachCnt = 1 ;
    var isMaxCnt = false;
    var isAddPreIndex = false;
    for(var i = 0 ;i < totalCnt  ; i ++){

        let outArr = arr[i].split(";")

        let outKey = encodeTx(outArr[0])
        let outVal = encodeTx(outArr[2]) + ";" +  Number(outArr[3]).toString(16);
        
        if(resultVal == ""){
            resultVal = outVal
            eachCnt = 1;
        }else{
            resultVal = resultVal + ":" + outVal;
            eachCnt ++;

            if(eachCnt > 4501){
                isMaxCnt = true;
            }
        }

        if(i + 1 < totalCnt){
            let outArrNext = arr[i + 1].split(";")
            let outKeyNext = encodeTx(outArrNext[0])

            if(outKeyNext != outKey){
                if(isAddPreIndex == true){
                    setKeyVal("in",outKey + ":1",resultVal);
                    isAddPreIndex = false;
                }else{
                    setKeyVal("in",outKey,resultVal);
                }
                resultVal = ""
            }
            if(isMaxCnt == true){
                setKeyVal("in",outKey,resultVal);
                resultVal = ""

                isAddPreIndex = true;
                isMaxCnt = false;
            }


        }else{
            setKeyVal("in",outKey,resultVal);
            resultVal = ""
        }

    }
    
    fs.writeFileSync(outFile,out.join("\n") );
    out = [];
}

function setKeyVal(key,outKey,resultVal){

    let outStr = "HSET " + key + " " + outKey + " " + resultVal ;
    out.push(outStr);
}

async function readTxt2Redis(){

    console.time('total');
    for(var z = 0 ; z < totalNum ;z ++){

        let fullIndex = startNum + z * step;

        let fullOutputsFile = txtPath + "outputs-" + fullIndex + ".txt";
        let fullinputsFile = txtPath + "inputs-" + fullIndex + ".txt";
        let fullOutRedisFile = redisPath + "out-" + fullIndex + ".txt";
        let fullInRedisFile = redisPath + "in-" + fullIndex + ".txt";

        //output
        await readEachTxt2Arr(fullOutputsFile);
        console.log("outputs-" + fullIndex + ".txt" + " : " + arr.length);
        await readEachOuput2Redis(fullOutRedisFile,0);
        arr = [];

        //input
        await readEachTxt2Arr(fullinputsFile);
        console.log("inputs-" + fullIndex + ".txt" + " : " + arr.length);
        await readEachInput2Redis(fullInRedisFile);
        arr = [];
    }

    console.timeEnd('total');

}

readTxt2Redis().then(() => {
    console.log("finish redisData ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);
});