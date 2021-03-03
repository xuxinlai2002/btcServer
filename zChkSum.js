const { Requester} = require('@chainlink/external-adapter')
//const Requester = require('request');

const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

var arguments = process.argv.splice(2);
if(arguments.length != 2){
    console.log("paramter err !");
    return 0;
}else{
    address = arguments[0];
    selHeight = parseInt(arguments[1]);
}

var arrBalanceInfo = new Array();
//
async function getTxCountSync(address){

  const url = `https://chain.api.btc.com/v3/address/${address}`

  var txCount = 0;
  await Requester.request(url, customError)
    .then(response => {
      txCount = response["data"]["data"]["tx_count"];
    })
    .catch(error => {
      txCount = -1
    })

    return txCount;
}


async function getTxInfoByPage(address,pageNum){


  const url = "https://chain.api.btc.com/v3/address/" + address + "/tx?page=" + pageNum
 
  await Requester.request(url, customError)
  .then(response => {
  
    txs = response["data"]["data"]["list"];
    len = txs.length;
    for(var i = 0 ; i < len ;i ++){
      const value = getValue(txs[i],address);
      //console.log(value + " : "+ txs[i]["block_height"]);
      var balanceInfo = {};
      balanceInfo["balance"] = value;
      balanceInfo["height"] = txs[i]["block_height"];
      arrBalanceInfo.push(balanceInfo);

    }


  })
  .catch(error => {
    console.log("get balance error :");
    console.log(error);
    return {timespan:0,txCnt:0};
   
  })

}


async function getBalanceByBlockHeight(){

  // const address = "12higDjoCCNXSA95xZMWUdPvXNmkAduhWv"
  // const selHeight = 9999

  // console.log(address);
  // console.log(selHeight);


  const txCount = await getTxCountSync(address);
  // console.log(txCount);
  const reqNum = Math.ceil(txCount / 50)
  // console.log(reqNum);

  for(var i = 1 ;i < reqNum + 1 ;i ++){
  
    await getTxInfoByPage(address,i);
  
  }

  const arrRet = arrBalanceInfo.reverse();
  len = arrRet.length;
  //console.log(arrRet);

  var retSum = 0
  for(var i = 0 ;i < len ;i ++){
    if( selHeight >= arrRet[i]["height"]){
      retSum += arrRet[i]["balance"];
      console.log(arrRet[i]);
    }

  }
  console.log(retSum);
  

}


//get value of certain address
function getValue(tx,address){

  //check output
  var outputs = tx["outputs"]
  var len = outputs.length
  //var ifFinish = false
  var outputValue = 0;
  for(var i = 0 ;i < len ; i ++){
    if(outputs[i]["addresses"].length > 0 && outputs[i]["addresses"][0] == address){
      //ifFinish = true;
      outputValue += outputs[i]["value"];
      //break;
     
    }
  }
  
  //check input
  var inputs = tx["inputs"]
  len = inputs.length
  var inputValue = 0;
  for(var i = 0 ;i < len ; i ++){
    if(inputs[i]["prev_addresses"].length > 0 && inputs[i]["prev_addresses"][0] == address){
      //ifFinish  = true;
      inputValue += -1 * inputs[i]["prev_value"]
      //break;
    }
  }

  return (outputValue + inputValue)

}


getBalanceByBlockHeight().then(() => {
  console.log("finish ...");
  //exit(0);
}).catch((e) => {
  console.log("error", e.message);

});



// const base58check = require('base58check')
 
// const data = '6934efcef36903b5b45ebd1e5f862d1b63a99fa5'
// console.log(base58check.encode(data.toUpperCase()))



// const address1 = '1AbHNFdKJeVL8FRZyRZoiTzG9VCmzLrtvm'
// //console.log(base58check.decode(address))
// console.log(base58check.decode(address1, 'hex'))