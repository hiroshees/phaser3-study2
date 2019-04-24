function hoist() {
  a = 10;
  var b = 20;
  let c = 30;
}

hoist();

console.log(a);
console.log(b);
console.log(c);
