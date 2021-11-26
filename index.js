const Web3 = require("web3");

const web3 = new Web3("http://localhost:9933");

const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
const GENESIS_ACCOUNT_PRIVATE_KEY =
  "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";

const toAddress = "0x31B98D14007bDEe637298086988A0bBd31184523";
const transferAmount = "100000";

async function signTx(web3, fields = {}) {
  const nonce = await web3.eth.getTransactionCount(GENESIS_ACCOUNT, 'latest');
  console.log('nonce', nonce);
  const transaction = {
   'nonce': nonce,
   ...fields,
  };
  return await web3.eth.accounts.signTransaction(transaction, GENESIS_ACCOUNT_PRIVATE_KEY);
}

async function sendTx(web3, fields = {}) {
  const signedTx = await signTx(web3, fields);
  web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
    if (!error) {
      console.log("Transaction sent!", hash);
      const interval = setInterval(function() {
        console.log("Attempting to get transaction receipt...");
        web3.eth.getTransactionReceipt(hash, function(err, rec) {
          if (rec) {
            console.log(rec);
            clearInterval(interval);
          }
        });
      }, 1000);
    } else {
      console.log("Something went wrong while submitting your transaction:", error);
    }
  });
}

function sendLegacyTx(web3) {
  web3.eth.estimateGas({
    from: GENESIS_ACCOUNT,
    to: toAddress,
    value: transferAmount,
  }).then((estimatedGas) => {
    console.log('estimatedGas', estimatedGas);
    web3.eth.getGasPrice().then((price) => {
      sendTx(web3, {
        gas: estimatedGas,
        gasPrice: price,
        to: toAddress,
        value: transferAmount,
      });
    });
  });
}

function sendEIP1559Tx(web3) {
  web3.eth.estimateGas({
    from: GENESIS_ACCOUNT,
    to: toAddress,
    value: transferAmount,
  }).then((estimatedGas) => {
    web3.eth.getGasPrice().then((price) => {
      sendTx(web3, {
        gas: estimatedGas,
        maxPriorityFeePerGas: '1',
        maxFeePerGas: price,
        to: toAddress,
        value: transferAmount,
      });
    });
  });
}

function getBalance() {
  web3.eth.getBalance(toAddress).then((balance) => {
    console.log('balance', balance);
  });
}

// sendLegacyTx(web3);
// sendEIP1559Tx(web3);
getBalance()
