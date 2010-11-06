// Worker listener.
self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
      self.postMessage({cmd: 'started'});
      break;
    case 'stop':
      self.postMessage({cmd: 'stopped'});
      self.close();
      break;
    case 'update':
      update(data.position);
      break;
    default:
      self.postMessage({cmd: 'unknown'});
  };
}, false);

/**
 * Send the force back to the device by posting a message back to the worker.
 * @param {Array<double>} force The force to send back to the device.
 */
function sendForce(force) {
  self.postMessage({cmd: 'force', force: force});
}