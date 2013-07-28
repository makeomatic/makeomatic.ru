var util = require('util'),
  format = util.format,
  EventEmitter = require('events').EventEmitter;

var stdout = process.stdout,
  columns = stdout.columns || 80,
  rows = stdout.rows || 25;

stdout.on('resize', function(){
  columns = stdout.columns || 80;
  rows = stdout.rows || 25;
});

var colors = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37
};

var styles = {
  bold: 1,
  italic: 3,
  underline: 4,
  inverse: 7,
  del: 9
};

var isNumber = function(i){
  return toString.call(i) === '[object Number]';
};

for (var i in colors){
  (function(i){
    var bgText = 'bg' + i.substring(0, 1).toUpperCase() + i.substring(1);

    String.prototype.__defineGetter__(i, function(){
      return '\x1B[' + colors[i] + 'm' + this + '\x1B[39m';
    });

    String.prototype.__defineGetter__(bgText, function(){
      return '\x1B[' + (colors[i] + 10) + 'm' + this + '\x1B[49m';
    });

    String.prototype.__defineGetter__(i + 'Bright', function(){
      return '\x1B[' + (colors[i] + 60) + 'm' + this + '\x1B[39m';
    });

    String.prototype.__defineGetter__(bgText + 'Bright', function(){
      return '\x1B[' + (colors[i] + 70) + 'm' + this + '\x1B[49m';
    });
  })(i);
}

for (var j in styles){
  (function(j){
    String.prototype.__defineGetter__(j, function(){
      return '\x1B[' + styles[j] + 'm' + this + '\x1B[22m';
    });
  })(j);
}

String.prototype.color = String.prototype.foreground = String.prototype.fg = function(i){
  if (isNumber(i)){
    return '\x1B[38;5;' + i + 'm' + this + '\x1B[39m';
  } else {
    if (i.match(/Bright$/)){
      var bright = true;
      i = i.replace(/Bright$/, '');
    }

    var code = colors[i];
    if (bright) code += 60;
    return '\x1B[' + code + 'm' + this + '\x1B[39m';
  }
};

String.prototype.background = String.prototype.bg = function(i){
  if (isNumber(i)){
    return '\x1B[48;5;' + i + 'm' + this + '\x1B[49m';
  } else {
    if (i.match(/Bright$/)){
      var bright = true;
      i = i.replace(/Bright$/, '');
    }

    var code = colors[i] + 10;
    if (bright) code += 60;
    return '\x1B[' + code + 'm' + this + '\x1B[49m';
  }
};

String.prototype.style = function(style){
  return '\x1B[' + styles[style] + 'm' + this + '\x1B[22m';
};

var Term = function(){
  this.__defineGetter__('columns', function(){
    return columns;
  });

  this.__defineGetter__('width', function(){
    return columns;
  });

  this.__defineGetter__('rows', function(){
    return rows;
  });

  this.__defineGetter__('height', function(){
    return rows;
  });
};

Term.__proto__ = EventEmitter.prototype;

Term.prototype.write = function(){
  stdout.write(format.apply(null, arguments));
  return this;
};

Term.prototype.reset = function(){
  stdout.write('\x1B[0m');
  return this;
};

Term.prototype.up = function(i){
  stdout.write('\x1B[' + i + 'A');
  return this;
};

Term.prototype.down = function(i){
  stdout.write('\x1B[' + i + 'B');
  return this;
};

Term.prototype.forward = Term.prototype.right = function(i){
  stdout.write('\x1B[' + i + 'C');
  return this;
};

Term.prototype.back = Term.prototype.left = function(i){
  stdout.write('\x1B[' + i + 'D');
  return this;
};

Term.prototype.line = function(i){
  if (i > 0){
    stdout.write('\x1B' + i + 'E');
  } else if (i < 0) {
    stdout.write('\x1B' + i + 'F');
  }

  return this;
};

Term.prototype.nextLine = function(i){
  stdout.write('\x1B' + i + 'E');
  return this;
};

Term.prototype.prevLine = function(i){
  stdout.write('\x1B' + i + 'F');
  return this;
};

Term.prototype.move = function(x, y){
  if (x < 0) x = columns + x;

  if (y){
    if (y < 0) y = rows + y;
    stdout.write('\x1B[' + x + ';' + y + 'H');
  } else {
    stdout.write('\x1B[' + x + 'G');
  }
  return this;
};

Term.prototype.scroll = function(i){
  if (i > 0){
    stdout.write('\x1B' + i + 'S');
  } else {
    stdout.write('\x1B' + i + 'T');
  }
  return this;
};

Term.prototype.scrollUp = function(i){
  stdout.write('\x1B' + i + 'S');
  return this;
};

Term.prototype.scrollDown = function(i){
  stdout.write('\x1B' + i + 'T');
  return this;
};

Term.prototype.clearScreen = function(){
  stdout.write('\x1B[2J');
  return this;
};

Term.prototype.clearLine = function(){
  stdout.write('\x1B[2K');
  return this;
};

Term.prototype.clearUp = function(){
  stdout.write('\x1B[1J');
  return this;
};

Term.prototype.clearDown = function(){
  stdout.write('\x1B[J');
  return this;
};

Term.prototype.clearStart = function(){
  stdout.write('\x1B[1K');
  return this;
};

Term.prototype.clearEnd = function(){
  stdout.write('\x1B[K');
  return this;
};

module.exports = new Term();