const http = require('http');
const request = require('request');
const url = require('url');
const cryptocoin = require('./Cryptocoin.js');

exports.Server = class {
  constructor(port) {
    this.port = port;
    this.coins = [];

    http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});

      const url_query = url.parse(req.url, true).query;
      const coin1_name = url_query.from;
      const coin2_name = url_query.to;

      let coin1 = undefined;
      let coin2 = undefined;

      this.coins.forEach((coin) => {
        if (coin.id === coin1_name) {
          coin1 = coin;
        } else if (coin.id === coin2_name) {
          coin2 = coin;
        }
      });

      if (coin1 && coin2) {
        const conversion_factor = coin1.convert_to(coin2);
        res.end(coin1.name + ' costs ' + conversion_factor + ' ' + coin2.name + 's');
      } else {
        res.end('Could not find such coins');
      }
    }).listen(this.port);

    request('https://api.coinmarketcap.com/v1/ticker/', (err, request_res, body) => {
      if (err) throw err;

      let coin_data = JSON.parse(body);
      coin_data.forEach((coin) => this.coins.push(new cryptocoin.Cryptocoin(coin.id, coin.name, coin.price_usd)));
    });
  }
}
