// Copyright 2010 Mohamed Mansour. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE file.

#ifndef HAPTICS_SERVICE_H_
#define HAPTICS_SERVICE_H_
#pragma once

#include "npfunctions.h"

#include "haptics_device.h"

namespace haptics {

class HapticsService {
 public:
  HapticsService(NPP npp);
  ~HapticsService();

  NPObject* GetScriptableObject();

  bool SendForce(NPObject* force_object);
  bool StartDevice(NPVariant* result_variant);
  bool StopDevice(NPVariant* result_variant);
  
  void GetPosition(NPVariant* position_variant);
  void GetInitialized(NPVariant* initialized_variant);

  bool debug() const { return debug_; }
  void set_debug(bool debug) { debug_ = debug; }

  // Send debug messages to the background.html page within chrome.
  void SendConsole(const char* message);

 private:
  NPP npp_;
  NPObject* scriptable_object_;
  NPObject* window_object_;
  HapticsDevice* device_;
  bool debug_;
};

}  // namespace haptics

#endif  // HAPTICS_SERVICE_H_
