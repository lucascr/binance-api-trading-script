// Author: Lucas Wiessel
// Date: 2023-03-24


//Command Line
//node index.js b
//node index.js c a
//node index.js s 0.0005 25705
//node index.js b 0.0005 25705
const Binance = require('binance-api-node').default;

// Replace with your Binance API key
const client = Binance({
  apiKey: 'APIKEY',
  apiSecret: 'APISECRET',
});

// Replace with the symbol of the spot market you want to buy
const BTCBUSD = 'BTCBUSD';

client.time().then(time => console.log(time));
//Spot Order Buy
async function SOBuy(thesymbol,quantity,price) {
    let response;
    console.log("Buy:"+price);
    try {
        response=await client.order({
            symbol: thesymbol,
            type: 'LIMIT',
            side: 'BUY',
            quantity: quantity,
            price: price
        });        
    } catch (err) {
        return err;
    }
}
//Spot Order Sale
async function SOSale(thesymbol,quantity,price) {
    let response;
    console.log("Sale:"+price);
    try {
        response=await client.order({
            symbol: thesymbol,
            type: 'LIMIT',
            side: 'SELL',
            quantity: quantity,
            price: price
        });        
    } catch (err) {
        return err;
    }
}
async function GP(thesymbol){ //Get Price
    let response;
    try {
        response=await client.prices({symbol:thesymbol});
        //console.log(response);
        return response;
    } catch (err) {        
        //console.log(err);
        return 0;
    }    
}
async function GB(){ //Get Book
    let response;
    try {
        response=await client.allBookTickers();
        //console.log(response.BTCBUSD);
        return response;
    } catch (err) {        
        //console.log(err);
        return 0;
    }    
}
async function GS(){ //Get Spot
    let getSpot;
    try {
        getSpot=await client.accountInfo();
        return getSpot;
    } catch (err) {        
        console.log(err);
        return 0;
    }    
}
async function GO(){ //Get Orders
    let getOrders;      
    try {
        getOrders=await client.openOrders({symbol:BTCBUSD});
        return getOrders;
    } catch (err) {        
        console.log(err);
        return 0;
    }    
}
async function CO(theOrderid){
    console.log("Cancelar:"+theOrderid);    
    let response=  await client.cancelOrder({symbol: 'BTCBUSD',orderId: theOrderid});
    return response;
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if( process.argv[2] === 'c'){    
    if( process.argv[3] === 'a'){
        console.log('Cancel ALL.');
        try{
            GO().then(function(getOrders){
                getOrders.forEach(theOrder =>{
                    CO(theOrder.orderId).then(console.log("Cancelando Buy")).finally(console.log("fin"));
                })

            })
        } catch (err) {
            return err;
        } finally {
            console.log('We do cleanup here');
        }
    }else if( process.argv[3] === 'b'){
        console.log('Cancel ALL Buy.');
        //if(theOrder.side=='Buy')

        GO().then(function(getOrders){
            getOrders.forEach(theOrder =>{
                if(theOrder.side=='BUY'){
                    CO(theOrder.orderId).then(console.log("Cancelando Buy")).finally(console.log("fin"));
                }
            })
        })

    }else if( process.argv[3] === 's'){
        console.log('Cancel ALL Sell.');
        GO().then(function(getOrders){
            getOrders.forEach(theOrder =>{
                if(theOrder.side=='SELL'){
                    CO(theOrder.orderId).then(console.log("Cancelando Sell")).finally(console.log("fin"));
                }
            })
        })
    }
}
if (process.argv.length < 5) {    
    GP(BTCBUSD).then(function(getPrice){
        GS().then(function(getSpot){
            console.log("GET SPOT");
            //console.log(getSpot);        
            symbols=['BTC','BUSD'];
            symbols_stables=['BUSD'];
            BUSD_total=0;
            BTC_total=0;
            BTC_lock=0;
            SPOT_total=0;
            getSpot.balances.forEach(bal => {
                if(symbols.indexOf(bal.asset)>-1){
                    console.log(bal.asset+" Free:"+bal.free+" Lock: "+bal.locked);
                    if(symbols_stables.indexOf(bal.asset)>-1){
                        BUSD_total+=parseFloat(bal.free)+parseFloat(bal.locked);
                    }else if(bal.asset=='BTC'){
                        BTC_total+=parseFloat(bal.free)+parseFloat(bal.locked);
                        BTC_lock=bal.locked;
                    }
                }
            });
            console.log("Stables: "+BUSD_total);
    
            BTC_USD=(parseFloat(getPrice.BTCBUSD)*BTC_total);
            console.log("BTC: "+BTC_total+ " USD: "+BTC_USD+" Lock: "+(parseFloat(getPrice.BTCBUSD)*BTC_lock));
            
            console.log("Spot: "+(parseFloat(BTC_USD)+parseFloat(BUSD_total)));

        })
    });
    GB().then(function(getBook){
        console.log(getBook.BTCBUSD);
        GP(BTCBUSD).then(function(getPrice){
            ///console.log(getPrice);
            console.error('Expected at least one argument!');
            process.exit(1);
        })
    })
}
if (process.argv.length > 4 && (process.argv[2] === 'b' ||  process.argv[2] === 's' ) ) {
    let quantity=parseFloat(process.argv[3]);
    if(quantity<0.0004){
        console.log('Qty Too Low.');
        process.exit(1);
    }
    let price=parseInt(process.argv[4]);
    console.log(quantity)
    console.log(price)
    GB().then(function(getBook){
        console.log(getBook.BTCBUSD);
        GP(BTCBUSD).then(function(getPrice){
            //console.log(getPrice);
            //console.log(getBook.BTCBUSD);
            //process.exit();
            let last_price = parseInt(getPrice.BTCBUSD);
            //price = last_price -50;
            let stop=1
            let step=2
            let total_orders=10
            if(process.argv[2] === 'b'){if(price>last_price){console.log("Price BUY es mayor");process.exit();}else{
                console.log("ok1");
                for (let i = 0; i < total_orders; i++) {
                    price_order_Buy=price-(i*step);
                    SOBuy(BTCBUSD,quantity,price_order_Buy).finally(console.log("comprado"));
                }
            }
            }else{if(price<last_price){console.log("Price SELL es Menor");process.exit();}else{
                console.log("ok2");
                for (let i = 0; i < total_orders; i++) {
                    price_order_Sell=price+(i*step);
                    SOSale(BTCBUSD,quantity,price_order_Sell);
                    //SOSale(BTCBUSD,'0.0005',price_order_Sell).then(function(result){console.log(result)});
                }
            }}
            console.log(getBook.BTCBUSD);
            console.log(getPrice);
        })
    })
    
} else {
    console.log('Buy or Sell.');    
}