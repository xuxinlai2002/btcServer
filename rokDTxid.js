//app.js
const fs = require('fs');
let readline = require('readline');

const { exit } = require('process');

const config = require('./config.json');
const okFile = config["okFile"];
const okFile2 = config["okFile2"];

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

function readEachRok2Arr(filePath){

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

async function readEachDTxid(outFile){

    const totalCnt = arr.length;
    out = [];

    for(var i = 0 ;i < totalCnt  ; i ++){

        let outArr = arr[i].split(";")
        let outLine = outArr[1] + ";" + outArr[2] + ";" + outArr[3] + ";" + outArr[4] + ";" + outArr[5] ;
        out.push(outLine);


    }
    
    fs.writeFileSync(outFile,out.join("\n") );
}


async function rokDTxid(){

    console.time('total');
    for(var z = 0 ; z < totalNum ;z ++){

        let endNum = startNum + 1 * step - 1;

        let okFileFull  = okFile  + startNum + "-" + endNum + "-tx_address.txt"; 
        let okFile2Full = okFile2 + startNum + "-" + endNum + "-tx_address.txt"; 
       
        //output
        await readEachRok2Arr(okFileFull);
        await readEachDTxid(okFile2Full);
        arr = [];
        

        startNum = startNum + step;


    }

    console.timeEnd('total');

}

rokDTxid().then(() => {
    console.log("finish redisData ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);
});