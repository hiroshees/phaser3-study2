Cryptocoin = class{
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }

  convert_to(other_coin) {
    // method definition
  }
};

let bitcoin = new Cryptocoin('bitcoin', 10000);
let ethereum = new Cryptocoin('ethereum', 1000);

bitcoin.convert_to(ethereum);
