function Cryptocoin(name, price) {
  this.name = name;
  this.price = price;
};

Cryptocoin.prototype.convert_to = function (other_coin) {
  // method definition
};

let bitcoin = new Cryptocoin('bitcoin', 10000);
let ethereum = new Cryptocoin('ethereum', 1000);

bitcoin.convert_to(ethereum);
