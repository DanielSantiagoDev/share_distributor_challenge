## Node.js financial shares distribution challenge 2022 solution

## Notes

Made with typescript, unit tested with jest. 
Entry point is index.js. 
Used express for the small api.
Dockerized

## Implementations and assumptions

This application has 3 executions modes: Standard, with target CPA and with partial shares.

* Standard: As defined on the document, each given share is picked randomly from a pool of shares that are distributed in 3 ranges: Cheap, medium and expensive. Depending of the weighted chance of getting each range, a price range is picked, and then a random share from that range is chosen and distributed to the user. There is a limitation to do not give another share of a overrepresented range, so the share range distribution should work even on low volumes of shares given.

* With CPA: Pretty much like standard, but instead of picking a weighted price range, the price range is chosen depending on the difference between the current CPA and the target CPA. Because only the range is chosen by the algorithm, and then a random share on that range is picked, a 100% precision on low numbers of shares distributed is not guaranteed (as I guess is expected). Actually there is a 0.1 precision with the cpa when around 100-200 shares distributed, and more precision as the distributed shares increase. (test included to prove this)

* With Partial Shares: Because having CPA and also giving partial shares would cause to give every person an exact % of an expensive share, wich totally eliminate the randomess in the application, partial shares are only available to give when CPA is disabled, relying on "standard" functionality with a twist: Instead of give a random share in the selected price range, we give a partial of a RANDOM picked high-cost share. After picking the random high-cost share, the % of the share to give the user is calculated based on the maximum and minimun price of that range.

* You can decide wich execution mode you with either through ENV variables, the Free_shares_giver constructor or the share_algorithm.json config file.

* The minimum and maximun price range for each range can be configured with ENV variables, as requested.Also de target CPA can be given with ENV variables. If no one is provided, a default fallback is given.
* A postman file is included to the documentation of the API.

## Other assumptions
 *As it is a mock, the market is always open (but is checked if it is open or not when neccesary, but no close scenario is conteplated on the code)
 *As it is a mock, not providing an account_id on the POST request will result in a default one being added

## Requirements

* Node
* Git
* Docker
* Typescript

## Common setup

1 - git clone the repository
```bash
npm install
```

2 - To run the server,

```bash
npm start
```

It should be accesible at localhost:7002 or at the port provided in ENV config

## Docker setup 
```bash
docker build . -t daniel_santiago/node_finance_app
```
```bash
docker run -p 49160:7002 -d daniel_santiago/node_finance_app
```

After that, it should be accesible at localhost:49160
## TEST
Made with jest : Run the following
```bash
npm run test
```
![Alt text](./unit_tests.gif?raw=true "Optional Title")

## API

Postman collection (documentation) is provided, but the project consist of one POST endpoint at /claim-free-share with the next JSON body: 
```bash
{"account_id" : "X-34234"}
```



