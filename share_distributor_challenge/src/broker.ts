const data = require('../symbols.json');

let symbols : Array<{tickerSymbol: string}> = data;

export class Broker {

  stock_market  : string;
  symbols_raw   : Array<{symbol:string,price:number}> = data;
  symbols_list  : Array<{tickerSymbol: string}> = data.map((item : {symbol:string,price:number})=>{return {tickerSymbol : item.symbol}});
  symbols_price : {[key:string]:number} = {}; // hashmap for fast accesing the price, as there is no method to return both symbol name and symbol price
  acc_positions : Array<{ tickerSymbol: string, quantity: number, sharePrice: number }> = [];


  constructor(stock_market: string = "nasdaq") {
    this.stock_market = stock_market;
    this.symbols_raw.forEach(share => {
      this.symbols_price[share.symbol] = share.price
    });
  }
  
  listTradableAssets() : Promise<Array<{tickerSymbol: string}>> {
    return new Promise((resolve,reject)=>{
        resolve(this.symbols_list);
    })
  }


  getLatestPrice(tickerSymbol: string) : Promise<{sharePrice:number}> {
    return new Promise((resolve,reject)=>{
      resolve({sharePrice : this.symbols_price[tickerSymbol]});
    })
  }

  isMarketOpen() : Promise<{ open: boolean, nextOpeningTime: string, nextClosingTime: string }> { //even if should be closed, we return always open:true to ensure the demo works
    return new Promise((resolve,reject)=>{
      resolve({ open: true, nextOpeningTime: "8:00", nextClosingTime: "22:00" });
    })
  }


  buySharesInRewardsAccount(tickerSymbol: string, quantity: number): Promise<{ success: boolean, sharePricePaid: number }> {
    return new Promise(async (resolve,reject)=>{
      let market_status = await this.isMarketOpen();
      if(market_status.open === true){
        let index = this.findRewardsShareIndex(tickerSymbol)
        if(index === -1){
          this.acc_positions.push({ tickerSymbol: tickerSymbol, quantity: quantity, sharePrice: this.symbols_price[tickerSymbol] })
        }else{
          this.acc_positions[index].quantity += quantity;
        }
        resolve({ success: true, sharePricePaid: this.symbols_price[tickerSymbol] });
      }else{
        resolve({ success: false, sharePricePaid: 0 });
      }
    })
  }

  getRewardsAccountPositions() : Promise<Array<{ tickerSymbol: string, quantity: number, sharePrice: number }>> {
    return new Promise((resolve,reject)=>{
      resolve(this.acc_positions);
    })
  }

  moveSharesFromRewardsAccount(toAccount: string, tickerSymbol: string, quantity: number): Promise<{ success: boolean }> {
    return new Promise((resolve,reject)=>{
      let success : boolean = false;
      if(this.acc_positions.length > 0){
        let foundIndex = this.findRewardsShareIndex(tickerSymbol);
        if(foundIndex > -1){
          if(this.acc_positions[foundIndex].quantity >= quantity){
            this.acc_positions[foundIndex].quantity = this.acc_positions[foundIndex].quantity - quantity;
            success = true;
          }
        }


      }
      resolve({success:success});
    })
  }


  findRewardsShareIndex(tickerSymbol: string){
    let foundIndex = -1;
    if(this.acc_positions.length > 0){
      foundIndex = this.acc_positions.findIndex((item,index)=>{
        if(item.tickerSymbol === tickerSymbol){
          return true
        }  
      })
    }

    return foundIndex;
  }

  
}