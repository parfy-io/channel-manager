const envParser = require('rainu-env-parser')

//DO NOT USE CAMEL_CASE! IT WILL TRANSFORMED TO lowercase!
const defaults = {
  log: {
    level: 'info'
  },
  mqtt: {
    broker: "localhost:1883",
    username: null,
    password: null,
    client: {
      id: "channel-manager"
    },
    topic: {
      in: "decide/+/+",
      out: "notify/__TYPE__/__CLIENT_ID__/__CORRELATION_ID__",
      status: "status/__CLIENT_ID__/__CORRELATION_ID__"
    }
  },
  client: {
    user: {
      base: 'http://user-service:80'
    },
  }
}

const parseEnv = () => {
  let config =  envParser.parse("CFG_", defaults)

  return config
}

module.exports = {
  ...parseEnv(),
  parseEnv,

  buildStatusTopic(clientId, correlationId) {
    return this.mqtt.topic.status
      .replace("__CLIENT_ID__", clientId)
      .replace("__CORRELATION_ID__", correlationId)
  },

  buildOutTopic(clientId, correlationId, notificationType){
    return this.mqtt.topic.out
    .replace("__TYPE__", notificationType)
    .replace("__CLIENT_ID__", clientId)
    .replace("__CORRELATION_ID__", correlationId)
  },
}