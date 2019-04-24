const http = require('http');
const request = require('request');
const cryptocoin = require('./Cryptocoin.js');

let coins = [];

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  if (coins) {
    res.end(JSON.stringify(coins));
  } else {
    res.end('No data');
  }
}).listen(8080);

request('https://api.coinmarketcap.com/v2/ticker/', (err, request_res, body) => {
  if (err) throw err;

  let coin_data = JSON.parse(body);
  for (let coin_id in coin_data.data) {
    let coin = coin_data.data[coin_id];
    coins.push(new cryptocoin.Cryptocoin(coin.id, coin.name, coin.quotes.USD.price));
  }
});
