function Square(edges) {
  GeometricShape.call(this, edges);
}

Square.prototype = Object.create(GeometricShape.prototype);
Square.prototype.constructor = Square;

Square.prototype.area = function () {
  // calculate shape area
}
