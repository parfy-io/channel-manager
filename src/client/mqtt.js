const mqtt = require('mqtt')
const log = require('../log')

//exposed for mocking purposes
let $mqttConnect = mqtt.connect

const newMQTTClient = (broker, topic, username = "", password = "") => {
  let options = {}
  if(username){
    options = {
      username: username,
      password: password
    }
  }

  return {
    $client: $mqttConnect(`mqtt://${broker}`, options),

    start(cbDecision, cbError) {
      this.$client.on('connect', () => {
        log.info('Connection to mqtt broker established.')

        this.$client.subscribe(topic, {qos: 1}, (err) => {
          if (err) {
            log.error('Failed to connect to mqtt broker!', {error: err})
            cbError(err)
          }
        })
      })

      this.$client.on('message', (topic, message) => {
        const topicParts = topic.split('/')
        if (topicParts.length < 3) {
          log.warn('Received a invalid message - invalid topic structure')
          return
        }
        const correlationId = topicParts[topicParts.length - 1]
        const clientId = topicParts[topicParts.length - 2]

        try {
          const parsedMessage = JSON.parse(message.toString())
          if (!parsedMessage.userID) {
            log.warn('Received a invalid message', {clientId, correlationId, error: "no decision"})
            return
          }

          cbDecision(correlationId, clientId, parsedMessage.userID)
        } catch (e) {
          log.warn('Received a invalid message', {clientId, correlationId, error: e})
        }
      })
    },

    sendNotification(userId, topic) {
      this.$client.publish(topic, JSON.stringify({
        "user-id": userId,
      }), {qos: 1})
    },

    sendInfoStatus(code, message, topic) {
      this.sendStatus('info', code, message, topic)
    },
    sendErrorStatus(code, message , topic) {
      this.sendStatus('error', code, message, topic)
    },

    sendStatus(level, code, message, topic) {
      this.$client.publish(topic, JSON.stringify({
        level: level,
        source: 'channel-manager',
        code: code,
        message: message,
        timestamp: new Date().toISOString()
      }), {qos: 1})
    }
  }
}

module.exports = {
  newMQTTClient
}