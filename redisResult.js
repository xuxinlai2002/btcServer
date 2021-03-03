//app.js
const { exit } = require('process');
var processLine = require('child_process');
let readline = require('readline');

//fs
const fs = require('fs');

//--
var exportFullPath = require("./heler").exportFullPath;
var readBigFile = require("./heler").readBigFile;

var en = require('int-encoder');

//init param
var startNum = 0;
var arguments = process.argv.splice(2);

if(arguments.length != 1){
    console.log("paramter err !");
    return 0;
}else{
    startNum = parseInt(arguments[0]);
}

const outFullPath = exportFullPath(startNum,"out",0);
const addr2BalFullPath = exportFullPath(startNum,"addr2Bal",0);
var maxOutSubNum = 0;
var maxAddr2BalSubNum = 0;

async function main() {

    console.time('total ');

    await exportRaw();
    await ex2In();
    await in2De();

    // console.log(maxOutSubNum);
    // console.log(maxAddr2BalSubNum);
    console.timeEnd('total ');
};




async function exportRaw(){

    //redis out
    var cmd = "redis-cli hgetall out > " + outFullPath;
    processLine.execSync(cmd, [], { encoding : 'utf8' });
    console.log("export out" );

    //redis in
    cmd = "redis-cli hgetall addr2Bal > " + addr2BalFullPath;
    processLine.execSync(cmd, [], { encoding : 'utf8' });
    console.log("export addr2Bal" );

}

async function ex2In(){
    //console.log(outFullPath + " abc ....");
    //readBigFile("/Users/xuxinlai/ela/output/transactions-0-1.json",cbEx2in);
    await readBigFile(outFullPath,cbEx2In,0);
    console.log("ex2In out" );
    await readBigFile(addr2BalFullPath,cbEx2In,1);
    console.log("ex2In addr2Bal" );
   
}

//0:out ; 1:addr2Bal
function cbEx2In(arrData,subNum,type){

    //console.log(arrData.length);
    var out = new Array();
    var fieldKey = ""
    var fieldVal = ""
    var addData = ""
    var key = ""
    if(type == 0){
        key = "out"
    }else if(type == 1){
        key = "addr2Bal"
    }

    for(var i = 0 ;i < arrData.length ; i ++ ){


        if(i % 2 == 0){
            fieldKey = arrData[i].replace(/^\s*|\s*$/g,"")
        }else{
            fieldVal = arrData[i].replace(/^\s*|\s*$/g,"")

            //HSET in pRjLEXF27Li gOQfVuvWFOM;0
            addData = "HSET " + key + " " + fieldKey + " " + fieldVal
            out.push(addData);
        }

    }
    arrData = [];

    //console.log(subNum);
    //output to file 
    const fullFilePath = exportFullPath(startNum,key,1,subNum);
    fs.writeFileSync(fullFilePath,out.join("\n"));

    if(type == 0){
       maxOutSubNum = subNum
    }else if(type == 1){
       maxAddr2BalSubNum = subNum
    }
}

//
async function in2De(){

    //out
    for(var i = 0 ;i <= maxOutSubNum ;i ++ ){

        var fullFilePath = exportFullPath(startNum,"out",1,i);
        const arrContent = fs.readFileSync(fullFilePath).toString().split("\n");
        const contentLen = arrContent.length;
        var arrFileData = Array();

        var fullOutPath = exportFullPath(startNum,"out",2,i);

        for(var j = 0 ; j < contentLen ; j ++){

            //
            var txid,address,value;
            const arrEachContent = arrContent[j].split(" ");
            if(arrEachContent.length == 4){
                
                txid = en.decode(arrEachContent[2],16);
                var data = arrEachContent[3].split(";");
                address = data[0];
                value = en.decode(data[1]);

                const line = txid + ";" + address + ";" + value
                arrFileData.push(line);

            }else{
                console.log("out data error !");
            }
        }

        fs.writeFileSync(fullOutPath, arrFileData.join("\n"));

    }
    console.log("in2De out" );


    //addr2Bal
    for(var i = 0 ;i <= maxAddr2BalSubNum ;i ++ ){

        var fullFilePath = exportFullPath(startNum,"addr2Bal",1,i);
        const arrContent = fs.readFileSync(fullFilePath).toString().split("\n");
        const contentLen = arrContent.length;
        var arrFileData = Array();

        var fullOutPath = exportFullPath(startNum,"addr2Bal",2,i);

        for(var j = 0 ; j < contentLen ; j ++){

            //
            var address,value;
            const arrEachContent = arrContent[j].split(" ");
            if(arrEachContent.length == 4){
                
                address = arrEachContent[2]
                value = en.decode(arrEachContent[3]);

                const line = address + ";" + value
                arrFileData.push(line);

            }else{
                console.log("out data error !");
            }
        }

        fs.writeFileSync(fullOutPath, arrFileData.join("\n"));
    }
    console.log("in2De addr2Bal" );
    
}

main().then(() => {
    //console.log("OK");
    //exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  