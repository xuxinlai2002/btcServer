const { exit } = require('process');
var processLine = require('child_process');

//db
const getConnection = require('./db').getConnection;
const query = require('./db').query;
const releaseConnection = require('./db').releaseConnection;


async function main() {

    console.time('total ');
    await getConnection();

    var ret = await query("select count(*) as cnt from txs",[]);
    console.log("txs : " + ret[0].cnt);

    ret = await query("select count(*) as cnt from tx_inputs",[]);
    console.log("txs_inputs : " + ret[0].cnt);

    ret = await query("select count(*) as cnt from tx_outputs",[]);
    console.log("txs_outputs : " + ret[0].cnt);

    ret = await query("select count(*) as cnt from tx_addresses",[]);
    console.log("tx_addresses : " + ret[0].cnt);

    await releaseConnection();

    const cmd = "redis-cli keys '*' |wc -l "
    cmdRet = processLine.execSync(cmd, [], { encoding : 'utf8' });

    console.log("redis : " + (Number(cmdRet.toString().replace(/(^\s*)|(\s*$)/g, "")) ))
    
    console.timeEnd('total ');
};

  
main().then(() => {
    console.log("Count OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  