const mqtt = require('mqtt');
client = mqtt.connect("mqtt://elliotsystemsonline.com");
client.on('connect', function () {
  console.log('Connected to MQTT Broker');
  
  // Publish data when the function is called
  // myFunctionToPublishData();
});
// client.publish("test111", "Hello mqtt1111");
module.exports = client;