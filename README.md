# Add permissions to the Lambda function's IAM role that allow it to call SES

[Create a new AWS Identity and Access Management (IAM) role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-service.html) that allows your Lambda function to call SES by doing the following:

**Note**: It's a best practice to create and use a new IAM role for different Lambda functions. Avoid reusing roles across multiple functions.

1. In the left navigation pane of the [IAM console](https://console.aws.amazon.com/iam/), choose **Roles**.
2. Choose **Create Role**.
3. For **Select type of trusted entity**, choose **AWS service**.
4. For **Choose a use case**, choose **Lambda**, and then choose **Next: Permissions**.
5. For **Attach permissions policies**, choose the check box next to **AmazonSESFullAccess** managed policy by search for **SES**. Then, choose Next: Tags.
6. (Optional) Add IAM tags to the role for your use case. For more information, see [Tagging IAM resources](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_tags.html?icmpid=docs_iam_console#id_tags_procs).
7. Choose **Next: Review**.
8. For **Role name*** enter **lambda_ses_execution**.
9. Choose **Create role**.

# Create a Lambda function to processes Amazon SES and Amazon SNS notifications

[Create a Lambda function](https://docs.aws.amazon.com/lambda/latest/dg/getting-started-create-function.html) using the following sample code, and then name it **sesnotificationscode**. When creating the function, make sure that you assign to it the **lambda_ses_execution** role you created.

**Example Lambda function code to process Amazon SES and Amazon SNS notifications**

The following example Lambda function code checks for two types of Amazon SNS notifications. For more information on the types of notifications, see [Amazon SNS notification examples for Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/notification-examples.html).

```javascript
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
```

# Subscribe the Lambda function to one or more Amazon SNS topics

If you haven't already done so, [create at least one Amazon SNS topic](https://docs.aws.amazon.com/sns/latest/dg/sns-create-topic.html) and [configure an Amazon SES email domain to use that SNS topic for feedback notifications](https://docs.aws.amazon.com/ses/latest/dg/configure-sns-notifications.html). Then, do the following, using either the Amazon SNS console or the Lambda console.

**To subscribe a function to an Amazon SNS topic using the Amazon SNS console**

1. In the left navigation pane of the [Amazon SNS console](https://console.aws.amazon.com/sns/), choose **Topics**. Then, identify the SNS topic that is used in Amazon SES for bounce notifications. For example, identify an SNS topic named **ses_notifications_repo**.
2. Choose the ARN of the SNS topic to open the **Topic Details** page.
3. Choose **Create Subscription**.
4. For **Protocol**, choose **AWS Lambda**.
5. For **Endpoint**, enter the ARN of the Lambda function that you created. Then, choose **Create Subscription**.

**To subscribe a function to an Amazon SNS topic using the Lambda console**

1. In the [Lambda console](https://console.aws.amazon.com/lambda/), choose the Lambda function that you created earlier.
2. On the **Configuration** page, in the **Designer** pane, choose the **+Add trigger** button.
3. In the **Trigger configuration** dropdown list, choose **SNS**. A configuration panel appears below the designer.
4. In the **SNS topic** dropdown, choose the SNS topic that you want to subscribe the function to. Then, choose the **Add** button.

Repeat this process to add the different notification topics that you want to subscribe this Lambda function.

# Test the set up by sending an Amazon SES message to invoke the Lambda function

To send a test message, use one of the available mailbox simulator addresses to avoid a negative impact on your SES deliverability metrics. For more information, see [Using the mailbox simulator](https://docs.aws.amazon.com/ses/latest/dg/send-email-simulator.html).

After the Amazon SES message is sent, SES publishes a notification to the SNS topic. Amazon SNS then delivers the notification to Lambda as a JSON-escaped SES event notification object in the SNS event object.

To create sample events for local testing using the [Lambda console](https://console.aws.amazon.com/lambda/), see [Examples of event data that Amazon SES publishes to Amazon SNS](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-examples.html).

For SES bounce, complaint, and delivery notification examples, see [Examples of event data that Amazon SES publishes to Amazon SNS](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-examples.html).
