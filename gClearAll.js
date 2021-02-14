const { exit } = require('process');
var processLine = require('child_process');

//db
const getConnection = require('./db').getConnection;
const query = require('./db').query;
const releaseConnection = require('./db').releaseConnection;

async function main() {

    console.time('total ');
    await getConnection();

    await query("truncate txs",[]);
    await query("truncate tx_inputs",[]);
    await query("truncate tx_outputs",[]);
    await query("truncate tx_addresses",[]);

    await releaseConnection();

    const cmd = "redis-cli flushall"
    processLine.execSync(cmd, [], { encoding : 'utf8' });
    
    console.timeEnd('total ');
};

main().then(() => {
    console.log("clear OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});