const png = require('./test.png');
const svg = require('./test.svg');

require('./style.css');

function entry() {
  return [png, svg];
}

module.exports = entry;
