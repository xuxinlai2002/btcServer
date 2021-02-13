//app.js
const fs = require('fs');

const { exit } = require('process');
let readline = require('readline');

const config = require('./txAddresses2DB.json');
const okFile = config["okFile"];
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

async function checkEachTxt(){

    const totalCnt = arr.length;
    
    var curBlockNumer = arr[0].split(";")[4];
    for(var i = 0 ;i < totalCnt  ;i ++){
      const arrEachLine = arr[i].split(";")
      const eachBlockNumer = arrEachLine[4]
      if(eachBlockNumer - curBlockNumer > 1 ){
        console.log("check error tx : " + arrEachLine[0]  + " - BN : " + eachBlockNumer);
        exit(-1);
      }else{
        curBlockNumer = eachBlockNumer;
      }
    }
    
    console.log("check over : " + curBlockNumer);
}


async function txAddressesChk(){
    
  
  for(var z = 0 ; z < totalNum ;z ++){

    let fullIndex = startNum + z * step;
    let fullTxsFile = okFile + "tx_addresses-" + fullIndex + ".txt";    

    await readEachJson2Arr(fullTxsFile);
    console.log("tx_addresses-" + fullIndex + ".txt");
    await checkEachTxt();
    arr = [];
    
   
  }

}

txAddressesChk().then(() => {
    console.log("finish ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

});
