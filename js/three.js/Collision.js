/**
 * Simple JS Collision routines.
 * @author Mohamed Mansour / http://mohamedmansour.com
 */

// Name our geometry objects.
THREE.Geometry.prototype.name = 'GEOMETRY';
Cube.prototype.name = 'CUBE';
Sphere.prototype.name = 'SPHERE';
Plane.prototype.name = 'PLANE';

/**
 * Response of a collision, in case the renderer wants to see it!
 * @param {boolean} hit If it collided.
 * @param {double[]} force The force response
 */
CollisionResponse = function(hit, force) {
  this.hit = hit;
  this.force = force;
};


// Detection for Sphere to Sphere.
CollisionSphereSphereDetection = {};
CollisionSphereSphereDetection.check = function(position, object) {
  var objectPosition = object.position;
  var distance = position.distanceTo(object.position);
  var vector = position.clone().divideScalar(distance);
  var radius =  object.geometry.radius;
  var stiffness = 1000;
  var hit = false;
  var force = [];
  if (distance < radius) {
    vector.multiplyScalar(stiffness * (radius - distance) / (width / 0.05));
    force[0] = vector.x;
    force[1] = vector.y;
    force[2] = vector.z;
    hit = true;
  } else {
    force[0] = 0.0;
    force[1] = 0.0;
    force[2] = 0.0;
  }
  haptics.sendForce(force);
  return new CollisionResponse(hit, force);
};

// Detection for Sphere to Cube.
CollisionSphereCubeDetection = {};
CollisionSphereCubeDetection.check = function(position, object) {
  // Not implemented.
  return false;
};

// Detection for Sphere to Plane.
CollisionSpherePlaneDetection = {};
CollisionSpherePlaneDetection.check = function(position, object) {
  var stiffness = 1000;
  force[0] = 0.0;
  force[1] = 0.0;
  force[2] = 0.0;
  
  if (position.x < object.position.x)
    force[0] = stiffness * (object.position.x - position.x);
    
  if (position.y < object.position.y)
    force[1] = stiffness * (object.position.y - position.y);
    
  if (position.z < object.position.z)
    force[2] = stiffness * (object.position.z - position.z);
    
  sendForce(force);
  return false;
};


// Collision Detection Mapping.
Collision = {};
Collision.detectionMap = [];
Collision.detectionMap['SPHERE']  = CollisionSphereSphereDetection;
Collision.detectionMap['CUBE'] = CollisionSphereCubeDetection;
Collision.detectionMap['PLANE'] = CollisionSpherePlaneDetection;
Collision.collide = function (position, object) {
  var detection = Collision.detectionMap[object.geometry.name];
  if (detection.check(position, object)) {
    // Hit!
  }
};