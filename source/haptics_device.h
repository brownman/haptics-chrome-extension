// Copyright 2010 Mohamed Mansour. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
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

  void StartDevice();
  void StopDevice();

  void SynchronizeClient();

  // Is the button down.
  bool IsButtonDown();
  
  // Get position of the device.
  void GetPosition(double pos[3]);
private:
  void CheckError(const char* message);

  HAPTIC_CALLBACK(HapticsDevice, HDLServoOpExitCode, OnContact);
  HAPTIC_CALLBACK(HapticsDevice, HDLServoOpExitCode, OnState);

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
