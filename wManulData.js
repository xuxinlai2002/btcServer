//app.js
const fs = require('fs');
const { exit } = require('process');
let readline = require('readline');
var processLine = require('child_process');

const config = require('./config.json');
const addr2BalNum = config["addr2BalNum"];
const outNum = config["outNum"];
var startNum = 0;

var exportFullPath = require("./heler").exportFullPath;
const { Z_ASCII } = require('zlib');
var arguments = process.argv.splice(2);

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

async function manulData(){
    
  console.time('total ');
  const filePath = "/Users/xuxinlai/ela/btcServer/redis/in-364400.txt";
  await readEachData2Arr(filePath);

  console.log(arr.length);
  
  for(var i = 0 ;i < arr.length ;i ++){
    if(arr[i].length > 10000){
      console.log(i + ":" + arr[i].length);
    }
  }
  
  console.timeEnd('total ');

}


manulData().then(() => {
    console.log("finish ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

});
