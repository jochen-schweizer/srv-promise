# SRV Promise

A set of functions providing promisified interface
to resolve SRV domain names as an object, array of objects
or in-place inside of a URI.

The module is intended for microservices infrastrucutrs managed with **mesos**, **consul**
or other tools providing service registry through SRV DNS interface.

The goal is to have the same application bootstrap code
workig with a fixed host (e.g. in develpoment environment) and
with SRV domains (e.g. in production).

The SRV is recognized by one of the coditions (or both):

  * if protocol has `+srv` component, e.g. `mongodb+srv://weird-service.consul/myDb`
    similar to [http+srv draft](https://tools.ietf.org/html/draft-jennings-http-srv-05)
  * if domain name starts with `_` as described in
    [RFC 2782](https://www.ietf.org/rfc/rfc2782.txt)

Example:

```javascript
const srvPromise = require('srv-proxy');
const mongoose = require('mongoose');

const config = {mongoUri: 'mongodb+srv://_mongo._tcp.example.com'};

srvPromise
  .proxyUri(config.mongoUri)
  .then(uri => {
    console.log('uri resolved as: ' + uri);
    mongoose.connect(uri);    
  });

mongoose.connection.on('open', () => console.log('connected'));
```

## API

### proxyUri(uri, options)

takes URI, resolves it if it has an SRV domain, otherwise just passes through. Returns a promise resolved to the new

  * **uri**: string, any URI with a domain name, and optionally containing protocol, credentials, path or query
  * **options**: object

## License

MIT
