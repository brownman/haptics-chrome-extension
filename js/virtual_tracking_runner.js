importScripts('runner.js');

// Force to be displayed.
var force = [0.0, 0.0, 0.0];

// Stiffness of the spring that pulls the haptic to the tracking point.
var stiffness = 100.0;

// Amount of angle to be accumulated every time tick.
var incremental_angle = 0.005;

// Current time.
var time = 0;

// Radius of a circle to track by the haptic device.
var radius = 0.04;

// Desired position to track on the circle defined above.
var desired_position = [0.0, 0.0, 0.0];

// Distance between the device position and the desired position.
var distance = 0.0;

// Normal force vector.
var vector = [0.0, 0.0, 0.0];

// Force vector.
var force = [0.0, 0.0, 0.0];

// Parameters to calculate the magnetic force
// between the device position and the desired position.
var force_mag = 0.0;
var log_base1 = 1.05;
var slope = -1.0;
var range1 = 0.01;  
var range2 = 0.02;

/**
 * Overridden by Runner.
 */
function update(position) {
  // The desired position is calculated on the circle by the incremental angle.
  desired_position[0] = radius * Math.cos(incremental_angle * time);
  desired_position[1] = radius * Math.sin(incremental_angle * time);
  desired_position[2] = 0;

  // Calculate the distance.
  var distance = Math.sqrt( 
      (desired_position[0] - position[0]) * (desired_position[0] - position[0]) + 
      (desired_position[1] - position[1]) * (desired_position[1] - position[1]) + 
      (desired_position[2] - position[2]) * (desired_position[2] - position[2]));

  // Magnet-like force calculation by its magnitude based on the distance.
  if (distance < range1) {
    force_mag = Math.log(distance + 1.0) / Math.log(log_base1);
  } else if (distance < range2) {
    force_mag = slope * distance + Math.log(range1 + 1.0) / Math.log(log_base1) - 
        slope * range1;
  } else {
    force_mag = slope * range2 + Math.log(range1 + 1.0) / Math.log(log_base1) - 
        slope * range1;
  }

  // Normal force direction from the desired position
  // toward the tracking position.
  vector[0] = (desired_position[0] - position[0]) / distance;
  vector[1] = (desired_position[1] - position[1]) / distance;
  vector[2] = (desired_position[2] - position[2]) / distance;

  // Resultant force.
  force[0] = stiffness * force_mag * vector[0];
  force[1] = stiffness * force_mag * vector[1];
  force[2] = stiffness * force_mag * vector[2];

  // Increment time for next simulation tick
  time++;
  
  sendForce(force);
}