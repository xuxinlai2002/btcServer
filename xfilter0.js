//app.js
const fs = require('fs');
const { exit } = require('process');
let readline = require('readline');


const config = require('./config.json');
const addr2BalNum = config["addr2BalNum"];
const outNum = config["outNum"];
var startNum = 0;

var exportFullPath = require("./heler").exportFullPath;
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
    const arrContent = fs.readFileSync(fullFilePath).toString().split("\n");
    const contentLen = arrContent.length;

    var writeArr = [];

    for(var i = 0 ;i < contentLen ;i ++ ){

      arrLine = arrContent[i].split(" ");
      if(arrLine.length == 4 && arrLine[3] != 'a'){
        writeArr.push(arrContent[i]);
      }

    }

    fullFilePath = exportFullPath(startNum,"addr2Bal",3,z);
    fs.writeFileSync(fullFilePath,writeArr.join("\n") );


  }
 
  
  console.timeEnd('total ');

}


filter0().then(() => {
    console.log("finish ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

});
