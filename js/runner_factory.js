/**
 * Runner Factory that manages multiple workers. It will only run a single worker
 * at any time. 
 * @param {HTMLElement} opt_bkg An optional param that points to the current
 *                              background page.
 */
RunnerFactory = function(opt_bkg) {
  this.bkg_ = opt_bkg || chrome.extension.getBackgroundPage();
  this.haptics_ = this.bkg_.plugin;
  this.runners_ = {};
  this.worker_ = null;
  this.interval_ = null;
  this.current_runner_ = null;
};

/**
 * Adds a new runner to the factory.
 * @param {object<string, string>} runnerMap The string map of the runners.
 */
RunnerFactory.prototype.register = function(runnerMap) {
  this.runners_ = runnerMap;
};

/**
 * Retrieves the names of the runners in a list.
 * @returns {Array<string>} the runners.
 */
RunnerFactory.prototype.list = function() {
  var list_of_runners = [];
  for (var runner in this.runners_) {
    list_of_runners.push(runner);
  }
  return list_of_runners;
};

/**
 * Posts a message to the currently running worker.
 * @param {object} msg The msg to send to the currently running worker.
 */
RunnerFactory.prototype.post = function(msg) {
  if (this.worker_) {
    this.worker_.postMessage(msg);
  } else {
    this._error('Cannot post a message to the worker because nothing is running.');
  }
};

/**
 * Stop the currently running worker.
 * @param {string} name The worker to run.
 */
RunnerFactory.prototype.run = function(name) {
  if (this.worker_) {
    this._error('Cannot run [' + name + '] worker because another worker [' +
        this.current_runner_ + '] is still running!');
    return;
  }
  this.current_runner_ = name;
  this.worker_ = new Worker(this.runners_[name]);
  this.worker_.addEventListener('message', this._onMessage.bind(this), false);
  this.post({cmd: 'start'});
};

/**
 * Stop the currently running worker.
 */
RunnerFactory.prototype.stop = function() {
  if (this.worker_) {
    this.post({cmd: 'stop'});
  } else {
    this._error('Cannot stop the worker becuause nothing is running.');
  }
};

/**
 * WebWorker's callback message mechanism.
 * @param{object} e Worker callback event.
 * @private
 */
RunnerFactory.prototype._onMessage = function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'started':
      this._onStart();
      break;
    case 'stopped':
      this._onStop();
      break;
    case 'force':
      this._onForce(data.force);
      break;
    default:
      this._debug('unknown');
  }
};

/**
 * When a force update is requested, we need to update the haptics device
 * force property.
 * @param {Array<double>} force The force that is requested.
 * @private
 */
RunnerFactory.prototype._onForce = function(force) {
  this.haptics_.sendForce(force);
};

/**
 * The runner is requesting to start, so start the haptic loop routine that
 * runs every 1 millisecond. 
 * @private
 */
RunnerFactory.prototype._onStart = function() {
  this._debug('Started ' + this.current_runner_);
  this.interval_ = setInterval(function() {
    this._onHapticLoop();
  }.bind(this), 1, this);
};

/**
 * @private
 */
RunnerFactory.prototype._onStop = function() {
  clearInterval(this.interval_);
  this.haptics_.sendForce([0.0, 0.0, 0.0]);
  this.worker_.removeEventListener('message', this._onMessage, false);
  this.worker_ = null;
  this._debug('Stopped, ' + this.current_runner_);
};

/**
 *
 * @private
 */
RunnerFactory.prototype._onHapticLoop = function() {
  this.post({cmd: 'update', position: this.haptics_.position});
};

/**
 * Prints a debug message to the console.
 * @private
 */
RunnerFactory.prototype._debug = function(msg) {
  this.bkg_.console.debug(msg);
};

/**
 * Prints a error message to the console.
 * @private
 */
RunnerFactory.prototype._error = function(msg) {
  this.bkg_.console.error(msg);
};