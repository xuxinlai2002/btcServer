//app.js
const fs = require('fs');
let readline = require('readline');

const { exit } = require('process');

const config = require('./redisOutput.json');
const txtPath = config["txtPath"];
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

function readEachJson2Arr(filePath){

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

async function readEachTxt2Redis(outFile){

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

async function readTxt2Redis(){

    
    for(var z = 0 ; z < totalNum ;z ++){

        let fullIndex = startNum + z * step;
        let fullOutputsFile = txtPath + "outputs-" + fullIndex + ".txt";
        let fullOutRedisFile = redisPath + "out-" + fullIndex + ".txt";


        await readEachJson2Arr(fullOutputsFile);
        console.log("outputs-" + fullIndex + ".txt" + " : " + arr.length);

        await readEachTxt2Redis(fullOutRedisFile);

        arr = [];
        
    }

}

readTxt2Redis().then(() => {
    console.log("finish json2Txt ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

  });