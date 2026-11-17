// Полифилл для toReversed (для совместимости с Node.js < 20)
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}

// Полифилл для toSorted (для совместимости с Node.js < 20)
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return this.slice().sort(compareFn);
  };
}

// Полифилл для toSpliced (для совместимости с Node.js < 20)
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start, deleteCount, ...items) {
    const result = this.slice();
    result.splice(start, deleteCount, ...items);
    return result;
  };
}

// Полифилл для with (для совместимости с Node.js < 20)
if (!Array.prototype.with) {
  Array.prototype.with = function(index, value) {
    const result = this.slice();
    result[index] = value;
    return result;
  };
}