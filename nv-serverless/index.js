const serverless = require('serverless-http')
const express = require('express')
const app = express()

const Eos = require('eosjs')
const config_eos = require('./config/eos.js')
const eos = Eos(config_eos)

const config_cb = require('./config/coinbase.js')
const { CoinbaseCommerce } = require('coinbase-commerce')
const coinbase = new CoinbaseCommerce(config_cb)

app.get('/', function (req, res) {
  res.send('namevault.co api')
})

// ---------------------

// perform an account lookup.
app.get('/lookup/:account', function (req, res) {
  let { account } = req.params
  eos.getAccount(account)
      .then((account) => {
        res.status(200).json({success: true, account})
      })
      .catch((error) => {
        console.log(error)
        res.status(404).json({success: false, error: "Account not found"})
      })
})

// ---------------------

// create a payment checkout endpoint.
app.get('/checkout/:account', function (req, res) {
  let { account } = req.params
  coinbase.checkouts.create({
    "name": account,
    "description": "EOS Name Registration",
    "local_price": {
        "amount": config_cb.priceUSD,
        "currency": "USD"
    },
    "pricing_type": "fixed_price",
    "requested_info": []
  })
  .then((checkout) => {
    res.status(200).json({success: true, checkout, 
      redirect: `${config_cb.httpEndpoint}/${checkout.data.id}`})
  })
  .catch((error) => {
    console.log(error)
    res.status(404).json({success: false, error: "Could not create checkout."})
  })
})

module.exports.handler = serverless(app);