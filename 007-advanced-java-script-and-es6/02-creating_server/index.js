const http = require('http');
const request = require('request');

let coin_data = undefined;

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  if (coin_data) {
    res.end(coin_data);
  } else {
    res.end('No data');
  }
}).listen(8080);

request('https://api.coinmarketcap.com/v1/ticker/',(err, request_res, body) => {
  if (err) throw err;

  coin_data = body;
});
