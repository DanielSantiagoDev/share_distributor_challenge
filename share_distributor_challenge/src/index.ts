import express from 'express'
const bodyParser = require('body-parser');
import {Free_shares_giver} from './Free_shares_giver'

const share_giver = new Free_shares_giver();

const app = express()
app.use(bodyParser.json());
const port = process.env.PORT || 7002


async function start(){
    
    await share_giver.bootstrap();

    app.get('/', async(req,res,next) => {
        res.status(200).send("OKEY")
    })
    app.post('/claim-free-share', async(req,res,next) => {

        let account_id : string;

        if(req.body.account_id !== undefined){
            account_id = req.body.account_id
        }else{
            account_id = "X-Dummy-User"; //here we should return an error, but because is a mock I just put a placeholder instead
        }

        let result = await share_giver.give_share_to_user(account_id)
        res.status(200).send(result)
    })

 
    app.listen(port)
    console.log(`Running on port ${port}`)
}


start();


