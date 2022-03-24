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
exports.Free_shares_giver = void 0;
console.log("Init...");
const share_config = require('../share_algorithm.json');
const broker_1 = require("./broker");
function get_env_as_number(env_variable, default_value) {
    const envLimit = parseFloat(env_variable || '');
    const userLimit = Number.isInteger(envLimit) ? envLimit : default_value;
    return userLimit;
}
class Free_shares_giver {
    constructor(CPA, PARTIAL_SHARES) {
        this.CPA_ENABLED = share_config.CPA || false;
        this.PARTIAL_SHARES_ENABLED = share_config.PARTIAL_SHARES_ENABLED || false;
        this.given_partials = {};
        this.organized_shares = {
            cheap: [],
            middle: [],
            expensive: [],
            very_expensive: [] //here we hold the shares we intent to give a partial of, not a full share
        };
        this.broker = new broker_1.Broker();
        if (CPA !== undefined) {
            this.CPA_ENABLED = CPA;
        }
        if (PARTIAL_SHARES !== undefined) {
            this.PARTIAL_SHARES_ENABLED = PARTIAL_SHARES;
        }
        if (this.CPA_ENABLED) {
            this.PARTIAL_SHARES_ENABLED = false;
        }
        this.share_status = {
            total_dispatched: 0,
            total_dispatched_value: 0,
            CPA: get_env_as_number(process.env.CPA, 23),
            share_types: {
                cheap: {
                    chance: 0.95,
                    min: get_env_as_number(process.env.CHEAP_MIN, 3),
                    max: get_env_as_number(process.env.CHEAP_MAX, 10),
                    total_dispatched: 0,
                    total_dispatched_value: 0
                },
                middle: {
                    chance: 0.03,
                    min: get_env_as_number(process.env.MIDDLE_MIN, 10),
                    max: get_env_as_number(process.env.MIDDLE_MAX, 25),
                    total_dispatched: 0,
                    total_dispatched_value: 0,
                },
                expensive: {
                    chance: 0.02,
                    min: get_env_as_number(process.env.MIDDLE_MIN, 25),
                    max: get_env_as_number(process.env.MIDDLE_MAX, 200),
                    total_dispatched: 0,
                    total_dispatched_value: 0
                },
            }
        };
    }
    // we init auxiliary data structures that we use later
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let all_symbols_with_price = [];
                let all_symbols = yield this.broker.listTradableAssets();
                const asyncMethod = (symbol) => __awaiter(this, void 0, void 0, function* () {
                    let symbol_price = yield this.broker.getLatestPrice(symbol.tickerSymbol);
                    all_symbols_with_price.push({
                        symbol: symbol.tickerSymbol,
                        price: symbol_price.sharePrice
                    });
                });
                yield Promise.all(all_symbols.map((x) => asyncMethod(x)));
                this.organize_shares_by_price(all_symbols_with_price);
                resolve();
            }));
        });
    }
    //aux function to order all the shares by their price, based on the given ranges
    organize_shares_by_price(shares) {
        shares.forEach((share) => {
            let index;
            for (index in this.organized_shares) {
                if (index === "very_expensive" && this.PARTIAL_SHARES_ENABLED && (share.price > this.share_status.share_types["expensive"].max)) {
                    this.organized_shares["very_expensive"].push(share);
                }
                else if (index !== "very_expensive" && (this.share_status.share_types[index].min <= share.price) && (share.price < this.share_status.share_types[index].max)) {
                    this.organized_shares[index].push(share);
                }
            }
        });
    }
    give_share_to_user(account_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let share = this.get_free_share();
                yield this.broker.buySharesInRewardsAccount(share.symbol, share.amount);
                yield this.broker.moveSharesFromRewardsAccount(account_id, share.symbol, share.amount);
                resolve(share);
            }));
        });
    }
    get_Share(share_type_selected) {
        let shares_in_range = this.organized_shares[share_type_selected];
        if (this.PARTIAL_SHARES_ENABLED === true) {
            shares_in_range = this.organized_shares["very_expensive"];
        }
        let picked_share = shares_in_range[Math.floor(Math.random() * shares_in_range.length)]; //get random specific share on target range
        if (this.PARTIAL_SHARES_ENABLED) {
            //we get the expensive share we want to divide, and depending on the money range we want to give, we get a split of the share corresponding to a random value in that range.
            let min = this.share_status.share_types[share_type_selected].min;
            let max = this.share_status.share_types[share_type_selected].max;
            let target_price = Math.random() * (max - min) + min;
            let total_price = picked_share.price;
            let shares_to_get = target_price / total_price;
            picked_share.amount = shares_to_get;
            if (this.given_partials[picked_share.symbol] === undefined) {
                this.given_partials[picked_share.symbol] = picked_share.amount;
            }
            else {
                this.given_partials[picked_share.symbol] += picked_share.amount;
            }
        }
        picked_share.amount = 1;
        //Collect statistics data
        this.share_status.share_types[share_type_selected].total_dispatched++;
        this.share_status.total_dispatched++;
        this.share_status.total_dispatched_value += picked_share.price / picked_share.amount;
        this.share_status.share_types[share_type_selected].total_dispatched_value += picked_share.price / picked_share.amount;
        return picked_share;
    }
    //return the price range of the share we want to give, each range having a % of being given.
    weighted_random_share_type(spec) {
        let sum = 0;
        let r = Math.random();
        let i;
        let selected_share_type;
        for (i in spec) {
            sum += spec[i];
            if (r <= sum) {
                selected_share_type = i;
                break;
            }
            ;
        }
        //If we randomed a share price range that is already full on the global %, we reroll the share until we get one that is suitable.
        if (this.share_status.total_dispatched > 0 && ((this.share_status.share_types[selected_share_type].total_dispatched / this.share_status.total_dispatched) > this.share_status.share_types[selected_share_type].chance)) {
            selected_share_type = this.weighted_random_share_type(spec);
        }
        return selected_share_type;
    }
    //depending of the execution mode of the algorithm, we return a shared based either in a % weighted random roll or on the most optimal range to approach our target CPA
    get_free_share() {
        let share_type_selected;
        let selected_share;
        if (this.CPA_ENABLED === true) {
            let net_money_status = (this.share_status.CPA * (this.share_status.total_dispatched + 1)) - this.share_status.total_dispatched_value;
            if (net_money_status < 0 || net_money_status < this.share_status.share_types.cheap.max) {
                share_type_selected = "cheap";
            }
            else if (net_money_status < this.share_status.share_types.middle.max) {
                share_type_selected = "middle";
            }
            else if (net_money_status > this.share_status.share_types.expensive.min) {
                share_type_selected = "expensive";
            }
            selected_share = this.get_Share(share_type_selected);
            return selected_share;
        }
        else {
            let types_aux = this.share_status.share_types;
            share_type_selected = this.weighted_random_share_type({ "cheap": types_aux.cheap.chance, "middle": types_aux.middle.chance, "expensive": types_aux.expensive.chance });
            selected_share = this.get_Share(share_type_selected);
            return selected_share;
        }
    }
}
exports.Free_shares_giver = Free_shares_giver;
//# sourceMappingURL=Free_shares_giver.js.map