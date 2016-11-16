const dns = require('dns');
const weighted = require('weighted');

function resolveSrv(host) {
  return new Promise((resolve, reject) => {
    dns.resolveSrv(host, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

/**
 * implements selection algorythm as described in RFC 2782
 * @return {Object|null} - object returned by dns.resolveSRv or null, if instances was empty
 */
function pickByPriorityAndWeight(instances) {
  if (!instances.length) {
    return null;
  }
  // find minimal priority
  const priority = instances.reduce((min, instance) => Math.min(min, instance.priority), 0);
  // select only ones with minimal priority
  instances = instances.filter(instance => instance.priority === priority);
  // pick one random instance taking weight into account
  return weighted.select(instances);
}

/**
 * select one service provider
 * @return {Object|null} - object returned by dns.resolveSRv or null, if instances was empty
 */
function resolveSrvOne(host) {
  return resolveSrv(host).then(pickByPriorityAndWeight);
}

function joinInstances(instances) {
  return instances
    .map(instance => instance.name + ':' + instance.port)
    .join(',');
}

/**
 * automatically recognize if URI refers to SRV domain
 * and replace the host with the resolved ones as a coma-separated list:
 * e.g.:  first.example.com:1234,second.example.com:4321
 * @return {Promise}
 */
function proxyUri(uri, opts) {
  opts = opts || {};
  const matched = uri.match(/^([a-z+]+:\/\/)?([^@:]+:[^@]+@)?([0-9a-z._:-]+)([#\/?].+)?$/);
  if (matched) {
    let isSrv = false;
    let [full, protocol, credentials, host, rest] = matched; // eslint-disable-line

    if (!host) {
      return Promise.reject('could not parse host in uri: ' + uri);
    }

    let protocolMatch = protocol.match(/^([a-z]+)\+srv/);
    if (protocolMatch) {
      isSrv = true;
      protocol = protocol.replace('+srv', '');
    }

    if (host[0] === '_' && opts.leadUnderscore !== false) {
      isSrv = true;
    }

    if (isSrv) {
      const resolver = opts.one ? host => [resolveSrvOne(host)] : resolveSrv;
      return resolver(host)
        .then(joinInstances)
        .then(newHost => {
          return (protocol ||  '')
            + (credentials || '')
            + newHost
            + (rest || '');
        });
    }
  }
  return Promise.resolve(uri);
}

module.exports = {
  pickByPriorityAndWeight,
  proxyUri,
  resolveSrv,
  resolveSrvOne
};
