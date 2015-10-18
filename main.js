var chess = require('chess'),
    twilio = require('twilio')('AC7bb2f43a783c6c974a8571d786605fa2', process.env.AUTH_TOKEN),
    express = require('express');
var app = express();


// create a game client
var gc = chess.create(),
    m = null,
    status = null;

// look at the valid moves
status = gc.getStatus();

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

app.post('/sms/reply/', function (req, res) {
  res.send('POST reqply', req);
  var body = '';

  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {

    var POST = qs.parse(body);

    //validate incoming request is from twilio using your auth token and the header from Twilio
    var token = process.env.AUTH_TOKEN,
    header = req.headers['x-twilio-signature'];

    //validateRequest returns true if the request originated from Twilio
    if (twilio.validateRequest(token, header, 'http://nicki.fn.lc:8183/sms/reply/', POST)) {
      //generate a TwiML response
      var resp = new twilio.TwimlResponse();
    resp.say('hello, twilio!');

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
