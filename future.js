// Author: Lucas Wiessel
// Date: 2023-03-24

//node future.js l 25840

const Binance = require('binance-api-node').default;

// Replace with your Binance API key
const client = Binance({
    apiKey: 'APIKEY',
    apiSecret: 'APISECRET',
});

// Replace with the symbol of the spot market you want to buy
const BTCBUSD = 'BTCBUSD';

client.time().then(time => console.log(time));
//Future Order Long
async function FOL(thesymbol,quantity,price) {
    let response;
    try {
        response=await client.futuresOrder({
            symbol: thesymbol,
            side: 'BUY',
            quantity: quantity,
            price: price,
            positionSide:'LONG'
        });
    } catch (err) {
        return err;
    }
}
//Future Order Short
async function FOS(thesymbol,quantity,price) {
    let response;
    try {
        response=await client.futuresOrder({
            symbol: thesymbol,
            side: 'SELL',
            quantity: quantity,
            price: price,
            positionSide:'SHORT'
        });
    } catch (err) {
        return err;
    }
}
async function GP(thesymbol){
    let response;
    try {
        response=await client.futuresPrices({symbol:thesymbol});
        console.log(response);
        return response;
    } catch (err) {        
        return 0;
    }    
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
if (process.argv.length === 3) {
    console.error('Expected at least one argument!');
    process.exit(1);
}
if (process.argv[2] && (process.argv[2] === 'l' ||  process.argv[2] === 's' ) ) {
    let price=parseInt(process.argv[3]);
    console.log(price)
    GP(BTCBUSD).then(function(result){
        console.log(result)
        let last_price = parseInt(result.BTCBUSD)-1;
        //price = last_price -50;
        let stop=1
        let step=1
        if(process.argv[2] === 'l'){if(price>last_price){console.log("Price BUY es mayor");process.exit();}else{
            console.log("ok1");
            for (let i = 0; i < 25; i++) {
                price_order_Buy=price-(i*step);
                FOL(BTCBUSD,'0.002',price_order_Buy);
            }
        }
        }else{if(price<last_price){console.log("Price SELL es Menor");process.exit();}else{
            console.log("ok2");
            for (let i = 0; i < 25; i++) {
                price_order_Sell=price+(i*step);
                FOS(BTCBUSD,'0.002',price_order_Sell);
                //SOSale(BTCBUSD,'0.0005',price_order_Sell).then(function(result){console.log(result)});
            }
        }}
    })
    //console.log(result)
    
} else {
    console.log('Buy or Sell.');
}