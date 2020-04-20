const cfg = require('./config')
const log = require('./log')
const mqtt = require('./client/mqtt')
const userService = require('./client/userService')

const mqttClient = mqtt.newMQTTClient(cfg.mqtt.broker, cfg.mqtt.topic.in, cfg.mqtt.username, cfg.mqtt.password)
const userServiceClient = userService.newUserService(cfg.client.user.base)

mqttClient.start((correlationId, clientId, userId) => {
    log.info("Start decision", {correlationId, clientId, userId})
    mqttClient.sendInfoStatus(202, 'Start decision.', cfg.buildStatusTopic(clientId, correlationId))

    userServiceClient.getUserChannels(clientId, userId, correlationId)
      .then(channels => {
        if(!channels) {
          log.warn("User has no channels configured!", {correlationId, clientId})
          mqttClient.sendErrorStatus(404, 'User has no channels configured.', cfg.buildStatusTopic(clientId, correlationId))
          return
        }

        let activeChannels = channels.filter(c => c.enabled)
        if(activeChannels.length === 0) {
          log.warn("User has no active channels configured!", {correlationId, clientId})
          mqttClient.sendErrorStatus(410, 'User has active no channels configured.', cfg.buildStatusTopic(clientId, correlationId))
          return
        }

        for(let channel of activeChannels){
          mqttClient.sendNotification(userId, cfg.buildOutTopic(clientId, correlationId, channel.type))
        }
        mqttClient.sendInfoStatus(200, 'User is notified.', cfg.buildStatusTopic(clientId, correlationId))
      }).catch(err => {
        log.error("Error while decide user notification.", {error: err, correlationId, clientId})
        mqttClient.sendErrorStatus(500, 'Error while decide user notification.', cfg.buildStatusTopic(clientId, correlationId))
      })
  },
    () => process.exit(2)
)