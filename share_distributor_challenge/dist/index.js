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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = require('body-parser');
const Free_shares_giver_1 = require("./Free_shares_giver");
const share_giver = new Free_shares_giver_1.Free_shares_giver();
const app = (0, express_1.default)();
app.use(bodyParser.json());
const port = process.env.PORT || 7002;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield share_giver.bootstrap();
        app.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.status(200).send("OKEY");
        }));
        app.post('/claim-free-share', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let account_id;
            if (req.body.account_id !== undefined) {
                account_id = req.body.account_id;
            }
            else {
                account_id = "X-Dummy-User"; //here we should return an error, but because is a mock I just put a placeholder instead
            }
            let result = yield share_giver.give_share_to_user(account_id);
            res.status(200).send(result);
        }));
        app.listen(port);
        console.log(`Running on port ${port}`);
    });
}
start();
//# sourceMappingURL=index.js.map