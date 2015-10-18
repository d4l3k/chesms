var chess = require('chess'),
    twilio = require('twilio'),
    express = require('express'),
    qs = require('querystring'),
    uuid = require('node-uuid');

var renderBoard = require('./lib/chess-renderer.js').renderBoard;

twilioClient = twilio('AC7bb2f43a783c6c974a8571d786605fa2', process.env.AUTH_TOKEN);


var app = express();


// create a game client
var gc = chess.create(),
    m = null,
    status = null;

// look at the valid moves
status = gc.getStatus();

console.log(renderBoard(status));

// make a move
m = gc.move('a4');

// look at the status again after the move to see
// the opposing side's available moves
status = gc.getStatus();

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
app.post('/sms/reply/', function (req, res) {
  var body = '';

  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {

    var POST = qs.parse(body);

    console.log('text body', POST);

    //validate incoming request is from twilio using your auth token and the header from Twilio
    var token = process.env.AUTH_TOKEN,
    header = req.headers['x-twilio-signature'];

    //validateRequest returns true if the request originated from Twilio
    if (twilio.validateRequest(token, header, 'http://nicki.fn.lc:8183/sms/reply/', POST)) {
    

      if(!phoneNumbers.hasOwnProperty(POST.To)){
        phoneNumbers[POST.To].gameId = uuid.v1();

        var currGameId = phoneNumbers[POST.To].gameId;

        //create new game
        games[currGameId].gc = chess.create();
        games[currGameId].players = [];
        games[currGameId].players.push(POST.To); 

        respMessage = 'Add your friends phone # to start a game';

      }else{
        var currGame = games[phoneNumbers[POST.To].gameId];

  
        var curr_gc = games[game_id].gc;
        var smsBody = POST.Body.replace(/^\s+|\s+$/g, '');

        //generate a TwiML response
        var resp = new twilio.TwimlResponse();
        var respMessage = '';

        //Check if we should add opponent or not
        if(currGame.players.length === 1){
          if(smsBody.length === 10){
            games[currGameId].push(smsBody); 
          }else {
            respMessage = 'incorrect number. Try adding a correct friends #';
          }
        }else if(currGame.players.length === 1){
          //If we lose or stalemate
          if(board.isCheckmate || board.isStalemate){
            //remove game
            delete game[phoneNumbers[POST.To].gameId];

            if(board.isCheckmate){
              respMessage = 'Checkmate. Game Over'
            }else {
              respMessage = 'Stalemate. Gameover'     
            }
          }
          //If we aren't losing
          else{

            //if we have a valid message
            //TODO: need to do proper validation
            if(smsBody.length > 4){

              //If we have a move command
              if(smsBody.slice(2,3) === 'to'){
                var piece_pos = smsBody.slice(0,1);

                var move_pos = smsBody.reverse().slice(0,1);

                //Error message
                try{
                  curr_gc.move(piece_pos, move_pos);
                }catch(err){
                  resp.message('Error'+err.message); 
                }else{
                  resp.message('Piece moved from '+piece_pos+' to '+move_pos);
                }

              }else if(smsBody.slice(0,3) === 'undo'){
                curr_gc.undo();
                resp.message('Move successfully undo');
              }
            }else{

              resp.message('Board\n' + renderBoard(gc.getStatus()));
            }
          }
        }

      }

      resp.message(respMessage); 
      //Write headers
      res.writeHead(200, { 'Content-Type':'text/xml' });
      res.end(resp.toString());
      
    }
    else {
      res.writeHead(403, { 'Content-Type':'text/plain' });
      res.end('you are not twilio - take a hike.');
    }
  });
});

var server = app.listen(8183, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('CheSMS listening at http://%s:%s', host, port);
});
