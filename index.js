var cloneDeep = require('lodash.clonedeep');
var merge = require('merge');

if (!window.Promise) {
  throw new Error('window.Promise not supported. Please provided a plolyfill.');
}

var Promise = window.Promise;

var originalFetch = window.fetch;
var _lastRequest_ = {};

function JSONPromise (data) {

  return function () {

    return new Promise(function (resolve, reject) {

      resolve(data);
    });
  };
}

function mockedFetch (_config_) {

  _config_ = _config_ || {};

  return function (url, options) {

    options = options || {};

    var req = _config_.request || {};
    var res = _config_.response || {};
    var config = merge(options, _config_.request || {});

    _lastRequest_ = cloneDeep(merge(config, {url}));

    return new Promise(function (resolve, reject) {

      // Defaults to responding with the original config
      var body = res.body !== undefined ? res.body : config;

      var response = {
        status: res.status || 200,
        statusText: res.statusText,
        headers: res.headers,
        json: JSONPromise(body)
      };

      resolve(response);
    });
  };
}

function mock (config) {

  config = config || {};

  _lastRequest_ = {};
  window.fetch = mockedFetch(config);
}

function restore() {

  _lastRequest_ = {};

  if (originalFetch) {
    window.fetch = originalFetch;
  }
}

function request () {

  return _lastRequest_;
}

module.exports = {
  mock: mock,
  restore: restore,
  request: request,
};
