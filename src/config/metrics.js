const promClient = require('prom-client');

const register = new promClient.Registry();

register.setDefaultLabels({
  app: 'url-shortener'
});

promClient.collectDefaultMetrics({ register });

const urlShortenedCounter = new promClient.Counter({
  name: 'url_shortened_total',
  help: 'Total number of URLs shortened',
  labelNames: ['user_type']
});

const urlRedirectCounter = new promClient.Counter({
  name: 'url_redirects_total',
  help: 'Total number of redirects'
});

const urlUpdateCounter = new promClient.Counter({
  name: 'url_updates_total',
  help: 'Total number of URL updates'
});

const urlDeleteCounter = new promClient.Counter({
  name: 'url_deletes_total',
  help: 'Total number of URL deletions'
});

const userRegistrationCounter = new promClient.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations'
});

const userLoginCounter = new promClient.Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins'
});

register.registerMetric(urlShortenedCounter);
register.registerMetric(urlRedirectCounter);
register.registerMetric(urlUpdateCounter);
register.registerMetric(urlDeleteCounter);
register.registerMetric(userRegistrationCounter);
register.registerMetric(userLoginCounter);

module.exports = {
  register,
  urlShortenedCounter,
  urlRedirectCounter,
  urlUpdateCounter,
  urlDeleteCounter,
  userRegistrationCounter,
  userLoginCounter
};