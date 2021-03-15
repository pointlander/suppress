var AWS = require('aws-sdk');

exports.handler = function(event, context, callback) {
  var message = event.Records[0].Sns.Message;
  message = JSON.parse(message);
  var messageType = message.notificationType;
  var destination = message.mail.destination.toString();

  var sesv2 = new AWS.SESV2();
  if (messageType == "Bounce") {
    var params = {
      EmailAddress: destination,
      Reason: 'BOUNCE'
    };
    sesv2.putSuppressedDestination(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else     console.log(data);
    });
  } else if (messageType == "Complaint") {
    var params = {
      EmailAddress: destination,
      Reason: 'COMPLAINT'
    };
    sesv2.putSuppressedDestination(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else     console.log(data);
    });
  }
};
