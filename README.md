# ADMIN PANEL

React app integration with solidity smart contract in ethereum using web3 library

## Setup

### Ganache

1. Make sure you have ganache and truffle installed and run these commands from solidity folder
   `npm run chain`
   `truffle migrate --reset`

2. In the client/src folder, make sure `dataProvider.js` file has ganache contract address activated (line 4).

3. In client folder, run `npm start` to run development server

### Rinkeby

1. Create `.env` file in the solidity folder, and paste your mnemonics and [infura](https://infura.io/) key according to the `.env.sample` file provided. You can retrieve your mnemonics from the metamask seed phrase

2. Deploy contracts to Rinkeby network, by running `npm run deploy` from the solidity folder. Make sure to have fake rinkeby ether in the first account from the mnemonics

3. In the client/src folder, make sure `dataProvider.js` file has rinkeby contract address activated (line 5).

4. In client folder, run `npm start` to run development server


## Netlify deployment

1. Create account on netlify
2. Install `netlify-cli` on your pc `npm install netlify-cli -g`
3. Run `netlify login` and authorize your pc on browser
4. Go to repo, client folder, and run `npm run build` and then `netlify deploy --prod --dir=./build`