const axios = require("axios")

const newUserService = (baseUrl) => {
  return {
    $axios: axios.create({
      baseURL: `${baseUrl}/v1/`,
      headers: {
        'User-Agent': 'channel-manager',
      },
    }),

    getUserChannels(clientId, userId, correlationId, offset = 0, limit = 500) {
      return this.$axios.get(`/clients/${clientId}/users/${userId}/channels`, {
        'headers': {
          'X-Correlation-ID': correlationId
        },
        params: {
          "offset": offset,
          "limit": limit,
        }
      }).then(res => {
        if(!res || !res.data) {
          throw new Error("Error while calling UserService: the response is invalid.")
        }

        return res.data
      })
    }
  }
}

module.exports = {
  newUserService
}
