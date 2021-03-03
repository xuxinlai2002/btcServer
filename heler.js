var en = require('int-encoder');

function encodeInt(nVal) {

  var hex = Number(nVal).toString(16);
  var enHex = en.encode(hex,16);
  return enHex;
}

function encodeTx(orgTx){
  return en.encode(orgTx.substr(0,16),16);
}


function decodeInt(org) {

  var isMinus = false
  var realInt = org

  if(org.substr(0,1) == "!"){
    isMinus = true
    realInt = org.substr(1);
  }



  var enHex = en.decode(realInt,16);
  var ret = parseInt(enHex,16);
  ret = isMinus? -ret : ret

  return ret;
}


const config = require('./config.json');

const num = config["num"];
const step = config["step"];
const okPath = config["okFile"];

function getTx2AddressFullPath(startNum){

  const endNum = startNum + step - 1
  return getFullPath(startNum,endNum,"tx_address");

}

//0
function exportFullPath(startNum,fileName,type,subNum=null){

  const endNum = getEndNumber(startNum);
  return getFullPath(startNum,endNum,fileName,type,subNum);

}


function getEndNumber(startNum){
  return startNum + num * step - 1
}

function getFullPath(startNum,endNum,fileName,type=null,subNum=null){

  var tmpPath = startNum + "-" + endNum + "-" + fileName;
  if(type == null){
    return okPath + tmpPath + ".txt"
  }else{

    tmpPath = okPath + "sum-" + startNum + "-" + endNum + "-" + type + "-" + fileName;
    if(subNum == null){
      return tmpPath + ".txt"
    }else{
      return tmpPath + "-" + prefixInteger(subNum,5) + ".txt"
    }

  }

}

function prefixInteger(num, length) {
  return (Array(length).join('0') + num).slice(-length);
}


var fs = require('fs');
var readline = require('readline');
var maxFileNum = config["maxFileNum"];

function readBigFile(fullFileName,callback,type){

    // 返回一个 Promise
    return new Promise(( resolve, reject ) => {

      var lineNo = 1;
      var dataArr = new Array();
      let fRead = fs.createReadStream(fullFileName);
      let objReadline = readline.createInterface({
          input: fRead
      });
    
      var subNum = 0;
      objReadline.on('line', line => {

        dataArr.push(line);
        if(lineNo % maxFileNum == 0){

          subNum = lineNo / maxFileNum - 1
          callback(dataArr,subNum,type);
          dataArr = [];

        }
        lineNo ++

      });

      objReadline.on('close', () => {

        subNum = Math.ceil(lineNo / maxFileNum ) - 1
        callback(dataArr,subNum,type);
        dataArr = [];

        //console.log("read over " + type);
        resolve();

      });
  });

}


module.exports.encodeInt =  encodeInt
module.exports.encodeTx =  encodeTx
module.exports.decodeInt =  decodeInt

module.exports.getTx2AddressFullPath =  getTx2AddressFullPath
module.exports.exportFullPath =  exportFullPath
module.exports.readBigFile = readBigFile

module.exports.prefixInteger = prefixInteger

