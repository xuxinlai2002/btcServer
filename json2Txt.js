//app.js
const fs = require('fs');
const { exit } = require('process');
let readline = require('readline');
const config = require('./config.json');

const txPath = config["jsonPath"];
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

async function readEachJson2Txt(fullTxsFile,fullInputsFile,fullOutputsFile){

    const totalCnt = arr.length;
    var txsArr = [];
    var outputsArr = [];
    var intputsArr = [];

    for(var i = 0 ;i < totalCnt  ;i ++){

        const txJson = JSON.parse(arr[i]);
        const is_coinbase = txJson["is_coinbase"] ? 1:0;

        //insert into txs
        let txStr = txJson["hash"] + ";" + txJson["block_number"] + ";" + txJson["block_timestamp"] +";"+is_coinbase ;
        txsArr.push(txStr);
        
        const txInputsJsons = txJson["inputs"];
        //console.log(txInputsJsons);
        for(var j = 0 ; j < txInputsJsons.length ; j ++ ){

            const txInputsJson = txInputsJsons[j];
            var addresses = txInputsJson["addresses"].join(',');
            if(addresses == ""){
                addresses = "0";
            }
            let inputsStr = txJson["hash"] + ";" + addresses + ";" + txInputsJson["spent_transaction_hash"] + ";" + txInputsJson["spent_output_index"];
            intputsArr.push(inputsStr);

        }

        //insert into tx_inputs
        const txOutputsJsons = txJson["outputs"];
        for(var j = 0 ; j < txOutputsJsons.length ; j ++ ){

            const txOutputsJson = txOutputsJsons[j];
            const value = txOutputsJson["value"];

            if(value > 0){
                const addresses = txOutputsJson["addresses"].join(',');
                let outputsStr = txJson["hash"]+";"+txOutputsJson["index"] +";"+addresses+";"+txOutputsJson["value"];
                outputsArr.push(outputsStr);
            }
        }

    }
    
    //----
    fs.writeFileSync(fullTxsFile,txsArr.join("\n") );
    fs.writeFileSync(fullInputsFile, intputsArr.join("\n"));
    fs.writeFileSync(fullOutputsFile, outputsArr.join("\n"));

    //----
    txsArr = [];
    intputsArr = [];
    outputsArr = [];
    arr = [];
}

async function readJson2Txt(){

    
    for(var z = 0 ; z < totalNum ;z ++){

        let fullIndex = startNum + z * step;
        let fullFileName = txPath + "transactions-" + fullIndex + ".json";

        let fullTxsFile = config["txtFile"] + "txs-" + fullIndex + ".txt";    
        let fullInputsFile = config["txtFile"] + "inputs-" + fullIndex + ".txt";
        let fullOutputsFile = config["txtFile"] + "outputs-" + fullIndex + ".txt";


        await readEachJson2Arr(fullFileName);
        console.log("transactions-" + fullIndex + ".json" + " : " + arr.length);
        await readEachJson2Txt(fullTxsFile,fullInputsFile,fullOutputsFile);
        
        

    }

}

readJson2Txt().then(() => {
    console.log("finish json2Txt ...");
    exit(0);
  }).catch((e) => {
    console.log("error", e.message);

  });