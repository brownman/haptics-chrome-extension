// Copyright 2010 Mohamed Mansour. All rights reserved.
// Use of this source code is governed by a GPL license that can
// be found in the LICENSE file.

#ifndef HAPTICS_DEVICE_H_
#define HAPTICS_DEVICE_H_
#pragma once

#include <hdl/hdl.h>
#include "haptics_signal.h"

namespace haptics {

class HapticsDevice {  
 // Define callback functions as friends.
 public:
  explicit HapticsDevice();
  ~HapticsDevice();

  void SendForce(double force[3]);
  void StartDevice();
  void StopDevice();

  void SynchronizeClient();

  // Is the main button pressed down.
  bool IsButtonDown();
  
  // Get position of the device.
  void GetPosition(double pos[3]);

  // Accessor to check if the device has been initialized.
  bool initialized() const { return initialized_; }
private:
  void CheckError(const char* message) const;
  
  HAPTIC_CALLBACK(HapticsDevice, HDLServoOpExitCode, OnContact);
  HAPTIC_CALLBACK(HapticsDevice, HDLServoOpExitCode, OnState);

  // Checks if the device is initialized successfully.
  bool initialized_;

  // Variables used only by servo thread
  double position_servo_[3];
  bool button_servo_;
  double force_servo_[3];

  // Variables used only by application thread
  double position_[3];
  bool button_;

  // Transformation from Device coordinates to Application coordinates
  double transformation_matrix_[16];

  HDLServoOpExitCode servo_callback_;
  HDLDeviceHandle device_handle_;
};

}  // namespace haptics

#endif  // HAPTICS_DEVICE_H_
