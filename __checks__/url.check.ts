import { UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'

new UrlMonitor('integrateapi-url-check', {
  name: 'IntegrateAPI Homepage',
  activated: true,
  maxResponseTime: 10000,
  degradedResponseTime: 5000,
  request: {
    url: 'https://integrateapi.io/',
    followRedirects: true,
    assertions: [
      UrlAssertionBuilder.statusCode().equals(200),
    ]
  }
})
