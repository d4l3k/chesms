var exports = module.exports = {};


var pieces = {
  white: {
    P: '♙',
    K: '♔',
    Q: '♕',
    R: '♖',
    B: '♗',
    N: '♘',
  },
  black: {
    P: '♟',
    K: '♚',
    Q: '♛',
    R: '♜',
    B: '♝',
    N: '♞',
  }
};

exports.renderBoard = function(board) {
  var disp = '';
  for (var x = 0; x < 8; x++) {
    disp+= 8-x+'';
    for (var y = 0; y < 8; y++) {
      var square = board.board.squares[(7-x)*8+y]
      if (square.piece) {
        var piece = square.piece.notation || 'P';
        disp += pieces[square.piece.side.name][piece];
      } else {
        if ((x+y) % 2 === 1) {
          disp += "□";
        } else {
          disp += "■"
        }
      }
    }
    disp += '\n';
  }
  disp += ' ABCDEFGH';
  return disp;
}
