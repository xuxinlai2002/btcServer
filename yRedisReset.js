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

async function filter0(){
    
  console.time('total ');
  for(var z = 0 ; z < addr2BalNum ;z ++){


    
    var fullFilePath = exportFullPath(startNum,"addr2Bal",1,z);

    //cat /Users/xuxinlai/ela/btcServer/bk/rok/sum-210000-219999-1-addr2Bal-00000.txt | redis-cli --pipe
    cmd = "cat " + fullFilePath + " | redis-cli --pipe"
    processLine.execSync(cmd, [], { encoding : 'utf8' });

    console.log("redis over addr2Bal :"  + z );

  }

  for(var z = 0 ; z < outNum ;z ++){


    
    var fullFilePath = exportFullPath(startNum,"out",1,z);

    //cat /Users/xuxinlai/ela/btcServer/bk/rok/sum-210000-219999-1-addr2Bal-00000.txt | redis-cli --pipe
    cmd = "cat " + fullFilePath + " | redis-cli --pipe"
    processLine.execSync(cmd, [], { encoding : 'utf8' });

    console.log("redis over out :"  + z );

  }
  
  console.timeEnd('total ');

}


filter0().then(() => {
    console.log("finish ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

});
