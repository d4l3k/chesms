var exports = module.exports = {};

exports.renderBoard = function(board) {
  var disp = '';
  for (var x = 0; x < 8; x++) {
    for (var y = 0; y < 8; y++) {
      var square = board.board.squares[x*8+y]
      if (square.piece) {
        disp += square.piece.notation;
        if (square.piece.notation == '') {
          disp += 'P';
        }
      } else {
        disp += " ";
      }
    }
    disp += '\n';
  }
  return disp;
}
