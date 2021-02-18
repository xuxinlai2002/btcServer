//app.js
const { exit } = require('process');
var processLine = require('child_process');


const config = require('./redisSortTxByAddress.json');
const redisPath = config["redisPath"];

const totalNum = config["num"];
const step = config["step"];
const txPath = config["txtFile"];
const okPath = config["okFile"];
const errPath = config["errFile"];
var en = require('int-encoder');

//redis
const getRedis = require('./redis').get
const delRedis = require('./redis').del;
//const { fstat } = require('fs');


const fs = require('fs');
//config

//init param


async function main() {

    console.time('total ');

    //await loadRedis(0)
    // for(var i = 0 ;i < 20000 ;i ++){
    //     await getRedis("3488a6f1569e535");
    // }
    
    // let data = await getRedis("000d50bc8ed090e0");
    // const retArr = data.split(";");
    // console.log(retArr);

    // if(data == null){
    //     console.log("is null");
    // }
    //console.log(data);
    //const keys = ["b460c02d3e30e460","b3323954a2c0f571"]
    //await delRedis(keys)
    //await delRedis("i*")
    // var responseData = Buffer.from("abc", 'utf8');
    // console.log(responseData);

    // var strTest = responseData.toString();
    // console.log(strTest);


    
    // var strToBase64 = new Buffer.from('60','base64').toString();
    // console.log("d1");
    // console.log(strToBase64);
    // console.log("d2");

    const org1 = '1HfMTmxPq1UUaXxzWFmtoiut3dPEDs6VYT';

    
    console.log("org1 " + org1 + " : " +  org1.length);
    rrg1 = en.encode(org1, 16);
    console.log("rrg1 " + rrg1 + " : " +  rrg1.length);

    drg1 = en.decode(rrg1, 16);
    console.log("drg1 " + drg1 + " : " +  drg1.length);










    // Uint8Array

    // const data = "b4";
    // fs.writeFileSync('testStr.txt', "set " + data + " myTest1");

    // const bin1 = Buffer.from("b4", 'hex');
    // // fs.writeFileSync('testBin.txt', "set " + bin1 + " myTest2");
    // let data = await getRedis(bin1);
    // console.log(data);



    console.timeEnd('total ');
};

//
async function loadRedis(z){

    const fullRedisPath = redisPath + "out-" + z + ".txt";
    const cmd = "cat " + fullRedisPath + " | redis-cli --pipe"
    
    var cmdRet = processLine.execSync(cmd, [], { encoding : 'utf8' });
    console.log(cmdRet.toString());
    
}


main().then(() => {
    console.log("OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  