/**
 * Runner Factory that manages multiple workers. It will only run a single worker
 * at any time. 
 * @param {HTMLElement} opt_bkg An optional param that points to the current
 *                              background page.
 */
RunnerFactory = function(haptics, renderer) {
  this.console_ = chrome.extension.getBackgroundPage().console;
  this.haptics_ = haptics;
  this.renderer_ = renderer;
  this.ctx_ = renderer.getContext('2d');
  this.runners_ = {};
  this.worker_ = null;
  this.haptic_interval_ = null;
  this.render_interval_ = null;
  this.current_runner_ = null;
  this.position_ = null;
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
  
  // Haptic loop runs every 1ms.
  this.haptic_interval_ = setInterval(this._onHapticLoop.bind(this), 1, this);
  
  // Renderer loop runs every 30 ms.
  this.render_interval_ = setInterval(this._onRenderLoop.bind(this), 30, this);
};

/**
 * @private
 */
RunnerFactory.prototype._onStop = function() {
  clearInterval(this.haptic_interval_);
  clearInterval(this.render_interval_);
  this.haptics_.sendForce([0.0, 0.0, 0.0]);
  this.worker_.removeEventListener('message', this._onMessage, false);
  this.worker_ = null;
  this._debug('Stopped, ' + this.current_runner_);
};

/**
 * Haptics loop that runs ever 1ms.
 * @private
 */
RunnerFactory.prototype._onHapticLoop = function() {
  this.position_ = this.haptics_.position;
  this.post({cmd: 'update', position: this.position_});
};

/**
 * Renderer loop that runs ever 1ms.
 * @private
 */
RunnerFactory.prototype._onRenderLoop = function() {
  // Temp gfx, for testing performance. Just to test stuff up.
  // We need to somehow figure out a proper design on how to render various
  // examples, since the haptic rendering happens within a Worker which doesn't
  // have access to the outside world unless through messaging. We don't want
  // to access the haptic logic worker since it might slow things down.
  
  // Clear the canvas.
  this.ctx_.clearRect(0, 0, this.renderer_.width, this.renderer_.height);
  
  // Since the workspace of the device is from -0.05 to +0.05 in all directions,
  // we make it relative by transforming the renderer workspace which is 0 to
  // 250. 
  var x = (this.position_[0] * 10000 + 500) / 4;
  var y = ((-1 * this.position_[1]) * 10000 + 500) / 4;
  var z = (this.position_[2] * 1000 + 50) / 4;
  
  // The radius of the pointer, to make it visible always start by 2px. The
  // depth is used for setting the transparency of the pointer, in case we would
  // like to draw some objects soon.
  var radius = 2 + z;
  var depth = Math.abs(radius) / 25;
  
  // Draw a circle using plain HTML5 canvas 2D techniques.
  this.ctx_.strokeStyle = "rgba(0,0,0," + depth + ")";
  this.ctx_.fillStyle = "rgba(0,0,0," + depth + ")";
  this.ctx_.beginPath();
  this.ctx_.arc(x, y, radius, 0, Math.PI * 2, true);
  this.ctx_.closePath();
  this.ctx_.stroke();
  this.ctx_.fill();
};

/**
 * Prints a debug message to the console.
 * @private
 */
RunnerFactory.prototype._debug = function(msg) {
  this.console_.debug(msg);
};

/**
 * Prints a error message to the console.
 * @private
 */
RunnerFactory.prototype._error = function(msg) {
  this.console_.error(msg);
};