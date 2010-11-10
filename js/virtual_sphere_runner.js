importScripts('runner.js');

// There is something very weird. When I set the number below decimal point as
// 0, there is no force on the device.For example, it works with 10.1, 14.7,
// etc. except 10.0, 13.0.
var force = [0.1, 0.1, 10.1];

// Stiffness of the sphere.
var stiffness = 1000.0;

// Virtual Sphere.
var radius = 0.04;

// Vector to calculate the new force.
var vector = [0, 0, 0];

/**
 * Overridden by Runner.
 */
function update(position) {
  var distance = Math.sqrt(position[0] * position[0] +
      position[1] * position[1] + position[2] * position[2]);

  vector[0] = position[0] / distance;
  vector[1] = position[1] / distance;
  vector[2] = position[2] / distance;

  if (distance < radius) {
    force[0] = stiffness * (radius - distance) * vector[0];
    force[1] = stiffness * (radius - distance) * vector[1];
    force[2] = stiffness * (radius - distance) * vector[2];
  } else {
    force[0] = 0.0;
    force[1] = 0.0;
    force[2] = 0.0;
  }
  
  sendForce(force);
}