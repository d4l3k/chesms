var chess = require('chess'),
    twilio = require('twilio'),
    express = require('express'),
    qs = require('querystring'),
    uuid = require('node-uuid');

var renderBoard = require('./lib/chess-renderer.js').renderBoard;

twilioClient = twilio('AC7bb2f43a783c6c974a8571d786605fa2', process.env.AUTH_TOKEN);


var app = express();


// create a game client
var board = chess.create(),
    m = null,
    status = null;

// look at the valid moves
status = board.getStatus();

console.log(renderBoard(status));

// make a move
m = board.move('a4');

// look at the status again after the move to see
// the opposing side's available moves
status = board.getStatus();

/*
twilio.sendMessage({

  to:'+16515556677', // Any number Twilio can deliver to
  from: '+14506667788', // A number you bought from Twilio and can use for outbound communication
  body: 'word to your mother.' // body of the SMS message

}, function(err, responseData) { //this function is executed when a response is received from Twilio

  if (!err) { // "err" is an error received during the request, if any

    "responseData" is a JavaScript object containing data received from Twilio.
      // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
      // http://www.twilio.com/docs/api/rest/sending-sms#example-1

      console.log(responseData.from); // outputs "+14506667788"
    console.log(responseData.body); // outputs "word to your mother."

  }
});
*/
var phoneNumbers = {};

var games = {};
app.post('/sms/reply/', function(req, res) {
    var body = '';

    req.on('data', function(data) {
        body += data;
    });

    req.on('end', function() {

        var POST = qs.parse(body);

        console.log('text body', POST);

        //validate incoming request is from twilio using your auth token and the header from Twilio
        var token = process.env.AUTH_TOKEN,
            header = req.headers['x-twilio-signature'];

        //validateRequest returns true if the request originated from Twilio
        if (twilio.validateRequest(token, header, 'http://nicki.fn.lc:8183/sms/reply/', POST)) {

            //generate a TwiML response
            var resp = new twilio.TwimlResponse();
            var respMessage = '';

            if (!phoneNumbers.hasOwnProperty(POST.From)) {
                phoneNumbers[POST.From] = {
                    gameId: uuid.v1(),
                };

                var currGameId = phoneNumbers[POST.From].gameId;

                //create new game
                games[currGameId] = {
                    board: chess.create(),
                    players: [],
                };
                games[currGameId].players.push(POST.From);

                respMessage = 'Add your friends phone # to start a game';

            } else {
                var currGame = games[phoneNumbers[POST.From].gameId];
                var smsBody = POST.Body.replace(/^\s+|\s+$/g, '');

                //Check if we should add opponent or not
                if (currGame.players.length === 1) {

                    //Add person
                    if (smsBody.length === 10) {
                        var number = '+1' + smsBody;
                        phoneNumbers[number] = phoneNumbers[POST.From];
                        currGame.players.push(number);
                        respMessage = 'Opponent with # ' + smsBody + ' successfully added\n' + renderBoard(currGame.board.getStatus());
                    } else {
                        respMessage = 'incorrect number. Try adding a correct friends #';
                    }
                }
                //Play Chess Game
                else {
                    //If we lose or stalemate
                    if (currGame.board.isCheckmate || currGame.board.isStalemate) {
                        //remove game
                        delete game[phoneNumbers[POST.From].gameId];

                        if (currGame.board.isCheckmate) {
                            respMessage = 'Checkmate. Game Over'
                        } else {
                            respMessage = 'Stalemate. Gameover'
                        }
                    }
                    //If we aren't losing
                    else {

                        //if we have a valid message
                        //TODO: need to do proper validation
                        if (smsBody.length >= 4) {

                            console.log(smsBody);
                            //If we have a move command
                            var parts = smsBody.split(' ');
                            var cmd = parts[0].toLowerCase();
                            if (cmd === 'move') {

                                var move_pos = parts[1];

                                //Error message
                                try {
                                    currGame.lastMove = currGame.board.move(move_pos);
                                } catch (err) {
                                    console.log(err);
                                    resp.message('Error: ' + err);
                                    res.writeHead(200, {
                                        'Content-Type': 'text/xml'
                                    });
                                    res.end(resp.toString());
                                    return;
                                }
                                console.log('piece moved');
                                respMessage = renderBoard(currGame.board.getStatus());
                            } else if (cmd === 'undo') {
                                currGame.lastMove.undo();
                                respMessage = 'Move successfully undo\n' + renderBoard(currGame.board.getStatus());
                            } else if (cmd === 'moves') {
                                respMessage = Object.keys(currGame.board.getStatus().notatedMoves).join(' ');
                            }
                        } else {
                            respMessage = renderBoard(currGame.board.getStatus());
                        }
                    }
                }
                currGame.players.forEach(function(player) {
                  if (player === POST.From) {
                    return;
                  }
                  twilioClient.messages.create({
                    body: respMessage,
                    to: player,
                    from: "+12065677559"
                  }, function(err, sms) {
                    console.log(sms);
                  });
                });
            }


            resp.message(respMessage);
            //Write headers
            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });
            res.end(resp.toString());
        } else {
            res.writeHead(403, {
                'Content-Type': 'text/plain'
            });
            res.end('you are not twilio - take a hike.');
        }
    });
});

var server = app.listen(8183, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('CheSMS listening at http://%s:%s', host, port);
});
