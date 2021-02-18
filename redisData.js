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
    var out = [];

    for(var i = 0 ;i < totalCnt  ; i ++){

        let outArr = arr[i].split(";")
        let outKey =  outArr[0].substr(0,15) + outArr[1]
        let outVal = outArr[2].replace(/nonstandard/,"n") + ";" + outArr[3];
        let outStr = "set " + outKey + " " + outVal ;
        out.push(outStr);
    }
    
    fs.writeFileSync(outFile,out.join("\n") );
}

async function readEachInput2Redis(outFile){

    const totalCnt = arr.length;
    var resultVal = "";
    out = [];
    for(var i = 0 ;i < totalCnt  ; i ++){

        let outArr = arr[i].split(";")
        var outKey =  outArr[0].substr(0,15)
        let outVal = outArr[1] + ";" + outArr[2].substr(0,15) + ";" + outArr[3];
        
       
        if(resultVal == ""){
            resultVal = outVal
        }else{
            resultVal = resultVal + "-" + outVal;
        }

        if(i + 1 < totalCnt){
            let outArrNext = arr[i + 1].split(";")
            let outKeyNext = outArrNext[0].substr(0,15)

            if(outKeyNext != outKey){
                setKeyVal(outKey,resultVal);
                resultVal = ""
            }
        }else{
            setKeyVal(outKey,resultVal);
            resultVal = ""
        }

    }
    
    fs.writeFileSync(outFile,out.join("\n") );
    out = [];
}

function setKeyVal(outKey,resultVal){

    let newOutKey = "i" + outKey;
    let outStr = "set " + newOutKey + " " + resultVal ;
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
    console.log("finish json2Txt ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);
});