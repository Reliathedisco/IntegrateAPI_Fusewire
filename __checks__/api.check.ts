import { ApiCheck, AssertionBuilder } from 'checkly/constructs'

new ApiCheck('integrateapi-api-check', {
  name: 'IntegrateAPI Integrations API',
  alertChannels: [],
  degradedResponseTime: 10000,
  maxResponseTime: 20000,
  request: {
    url: 'https://integrateapi.io/api/integrations',
    method: 'GET',
    followRedirects: true,
    skipSSL: false,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
    ],
  },
  runParallel: true,
})
