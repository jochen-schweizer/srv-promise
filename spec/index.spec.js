/* eslint-env jasmine */

const srvPromise = require('../src/index');

describe('index', () => {
  describe('proxyUri', ()=> {
    it('leaves fixed domain untouched', done => {
      srvPromise
        .proxyUri('http://example.com/some/path?foo=bar')
        .then(uri => {
          expect(uri).toBe('http://example.com/some/path?foo=bar');
          done();
        })
        .catch(done.fail);
    });
  });
});
