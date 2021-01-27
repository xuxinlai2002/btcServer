//app.js
const { exit } = require('process');
const config = require('./config.json');
const query = require('./db');

async function main() {

    //select from txs
    let queryTxSql = "select * from txs order by block_number,block_timestamp";
    const txs = await query(queryTxSql);
    const txCnt = txs.length;

    for(var i = 0 ;i < txCnt ; i ++){

        //case of coinbase 
        //tx = await dealCoinbase(txs[i].txid);
        if(txs[i].is_coinbase == 1){
            await dealCoinbase(txs[i].txid,txs[i].block_number,txs[i].block_timestamp);
        }else{
            await dealTx(txs[i].txid,txs[i].block_number,txs[i].block_timestamp);
        }

    }

};

async function dealCoinbase(txid,block_number,block_timestamp){
    await saveOputs(txid,block_number,block_timestamp);
}


async function dealTx(txid,block_number,block_timestamp){    
    await saveOputs(txid,block_number,block_timestamp);
    await saveInputs(txid,block_number,block_timestamp);
}

async function saveInputs(txid,block_number,block_timestamp){

    //select from txs
    let queryInputSql = "select * from tx_inputs where txid = ?";
    let queryInputSqlParams = [txid];

    const txInput = await query(queryInputSql,queryInputSqlParams);
    const txInputCnt = txInput.length;

    for(var i = 0 ;i < txInputCnt ; i ++){
        const retArr = await getValueFromOutputs(txInput[i].spend_tx_hash,txInput[i].spend_output_index);
        if(retArr[0] == 0 || retArr[1] == ""){
            console.log("xxl saveInputs exception ...");
        }else if(retArr[1].indexOf(",") != -1){
            console.log("input multiple addresses : tx=" + txid);
        }
        else{
            let txAddressesAddSql = "insert into tx_addresses(txid, address,value,isIn,block_number,block_timestamp) values (?, ?, ?, ?, ?, ?)";
            let txAddressesAddSqlParams = [
                txid,
                retArr[1],
                -retArr[0],
                0,
                block_number,
                block_timestamp
            ];
            await query(txAddressesAddSql,txAddressesAddSqlParams);
        }

    }

}

async function getValueFromOutputs(txid,index){

    var value = 0;
    let queryOutputSql = "select value,addresses from tx_outputs where txid = ? and output_index = ?";
    let queryOutputSqlParams = [txid,index];  

    const txOutput = await query(queryOutputSql,queryOutputSqlParams);
    const txOutputCnt = txOutput.length;

    if(txOutputCnt == 1){
        return [txOutput[0].value,txOutput[0].addresses];
    }

    return [value,""];

}


async function saveOputs(txid,block_number,block_timestamp){

    //select from txs
    let queryOutputSql = "select * from tx_outputs where txid = ?";
    let queryOutputSqlParams = [txid];

    const txOutput = await query(queryOutputSql,queryOutputSqlParams);
    const txOutputCnt = txOutput.length;

    for(var i = 0 ;i < txOutputCnt ; i ++){
        
        //add multiple address exception
        if(txOutput[i].addresses.indexOf(",") != -1){
            console.log("output multiple addresses : tx=" + txid);
        }else{
            let txAddressesAddSql = "insert into tx_addresses(txid, address,value,isIn,block_number,block_timestamp) values (?, ?, ?, ?, ?, ?)";
            let txAddressesAddSqlParams = [
                txid,
                txOutput[i].addresses,
                txOutput[i].value,
                1,
                block_number,
                block_timestamp
            ];
            await query(txAddressesAddSql,txAddressesAddSqlParams);

        }


    }

}
  
main().then(() => {
    console.log("OK");
    exit(0);
}).catch((e) => {
    console.log("Error", e);
});
  