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



//redis
const getRedis = require('./redis').get
const delRedis = require('./redis').del

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
    const keys = ["b460c02d3e30e460","b3323954a2c0f571"]
    //await delRedis(keys)
    //await delRedis("i*")



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
  