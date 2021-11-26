const ethers = require('ethers');

const network = 'http://127.0.0.1:9933';

const provider = new ethers.providers.JsonRpcProvider(network);

const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
const GENESIS_ACCOUNT_PRIVATE_KEY =
  "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";

const toAddress = "0x31B98D14007bDEe637298086988A0bBd31184523";
const transferAmount = "100000";

const wallet = new ethers.Wallet(GENESIS_ACCOUNT_PRIVATE_KEY)
const signer = wallet.connect(provider);

async function sendEth() {
  const estimateGas = await provider.estimateGas({
    from: GENESIS_ACCOUNT,
    to: toAddress,
    value: transferAmount,
  });

  const price = await provider.getGasPrice();

  const result = await signer.sendTransaction({
      to: toAddress,
      value: transferAmount,
      gasLimit: estimateGas,
      gasPrice: price,
      // maxFeePerGas: '1000000000',
      // maxPriorityFeePerGas: '1',
  });

  const interval = setInterval(function() {
    console.log("Attempting to get transaction receipt...");
    provider.getTransactionReceipt(result.hash, function(err, rec) {
      if (rec) {
        console.log(rec);
        clearInterval(interval);
      }
    });
  }, 1000);
}

sendEth()
