"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Broker = void 0;
const data = require('../symbols.json');
let symbols = data;
class Broker {
    constructor(stock_market = "nasdaq") {
        this.symbols_raw = data;
        this.symbols_list = data.map((item) => { return { tickerSymbol: item.symbol }; });
        this.symbols_price = {}; // hashmap for fast accesing the price, as there is no method to return both symbol name and symbol price
        this.acc_positions = [];
        this.stock_market = stock_market;
        this.symbols_raw.forEach(share => {
            this.symbols_price[share.symbol] = share.price;
        });
    }
    listTradableAssets() {
        return new Promise((resolve, reject) => {
            resolve(this.symbols_list);
        });
    }
    getLatestPrice(tickerSymbol) {
        return new Promise((resolve, reject) => {
            resolve({ sharePrice: this.symbols_price[tickerSymbol] });
        });
    }
    isMarketOpen() {
        return new Promise((resolve, reject) => {
            resolve({ open: true, nextOpeningTime: "8:00", nextClosingTime: "22:00" });
        });
    }
    buySharesInRewardsAccount(tickerSymbol, quantity) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let market_status = yield this.isMarketOpen();
            if (market_status.open === true) {
                let index = this.findRewardsShareIndex(tickerSymbol);
                if (index === -1) {
                    this.acc_positions.push({ tickerSymbol: tickerSymbol, quantity: quantity, sharePrice: this.symbols_price[tickerSymbol] });
                }
                else {
                    this.acc_positions[index].quantity += quantity;
                }
                resolve({ success: true, sharePricePaid: this.symbols_price[tickerSymbol] });
            }
            else {
                resolve({ success: false, sharePricePaid: 0 });
            }
        }));
    }
    getRewardsAccountPositions() {
        return new Promise((resolve, reject) => {
            resolve(this.acc_positions);
        });
    }
    moveSharesFromRewardsAccount(toAccount, tickerSymbol, quantity) {
        return new Promise((resolve, reject) => {
            let success = false;
            if (this.acc_positions.length > 0) {
                let foundIndex = this.findRewardsShareIndex(tickerSymbol);
                if (foundIndex > -1) {
                    if (this.acc_positions[foundIndex].quantity >= quantity) {
                        this.acc_positions[foundIndex].quantity = this.acc_positions[foundIndex].quantity - quantity;
                        success = true;
                    }
                }
            }
            resolve({ success: success });
        });
    }
    findRewardsShareIndex(tickerSymbol) {
        let foundIndex = -1;
        if (this.acc_positions.length > 0) {
            foundIndex = this.acc_positions.findIndex((item, index) => {
                if (item.tickerSymbol === tickerSymbol) {
                    return true;
                }
            });
        }
        return foundIndex;
    }
}
exports.Broker = Broker;
//# sourceMappingURL=broker.js.map