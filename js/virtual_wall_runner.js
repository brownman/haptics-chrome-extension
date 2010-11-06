importScripts('runner.js');

// There is something very weird. When I set the number below decimal point as
// 0, there is no force on the device.For example, it works with 10.1, 14.7,
// etc. except 10.0, 13.0.
var force = [0.1, 0.1, 10.1];

// Stiffness of the sphere.
var stiffness = 1000.0;

// Wall position in the Z access to hit.
var wall_position_z = 0.0;

/**
 * Overridden by Runner.
 */
function update(position) {
  if (position[2] < wall_position_z)
    force[2] = stiffness * (wall_position_z - position[2]);
  else
    force[2] = 0.0;

  sendForce(force);
}