var chess = require('chess'),
    twilio = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

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
setInterval(function() {
  client.messages.list(function(err, data) {
    data.messages.forEach(function(message) {
      console.log(message.body);
    });
  });
}, 1000);
