// Copyright 2010 Mohamed Mansour. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE file.

#ifndef SCRIPTING_BRIDGE_H_
#define SCRIPTING_BRIDGE_H_
#pragma once

#include <map>

#include <npapi.h>
#include <npfunctions.h>

namespace haptics {
  
// The class that gets exposed to the browser code.
class ScriptingBridge : public NPObject {
 public:
  typedef bool (ScriptingBridge::*MethodSelector)(const NPVariant* args,
                                                  uint32_t arg_count,
                                                  NPVariant* result);
  typedef bool (ScriptingBridge::*GetPropertySelector)(NPVariant* value);
  typedef bool (ScriptingBridge::*SetPropertySelector)(const NPVariant* result);

  explicit ScriptingBridge(NPP npp): npp_(npp) {}
  virtual ~ScriptingBridge();

  // These methods represent the NPObject implementation.  The browser calls
  // these methods by calling functions in the |np_class| struct.
  virtual void Invalidate();
  virtual bool HasMethod(NPIdentifier name);
  virtual bool Invoke(NPIdentifier name,
                      const NPVariant* args,
                      uint32_t arg_count,
                      NPVariant* result);
  virtual bool InvokeDefault(const NPVariant* args,
                             uint32_t arg_count,
                             NPVariant* result);
  virtual bool HasProperty(NPIdentifier name);
  virtual bool GetProperty(NPIdentifier name, NPVariant* result);
  virtual bool SetProperty(NPIdentifier name, const NPVariant* value);
  virtual bool RemoveProperty(NPIdentifier name);

  // Initializes all the bridge identifiers from JavaScript land.
  static bool InitializeIdentifiers(NPNetscapeFuncs* npfuncs);

  static NPClass np_class;

  // These methods are exposed via the scripting bridge to the browser.
  // Each one is mapped to a string id, which is the name of the method that
  // the broswer sees. Each of these methods wraps a method in the associated
  // HapticService object, which is where the actual implementation lies.

  // Starts the haptic device.
  bool StartDevice(const NPVariant* args, uint32_t arg_count,
                   NPVariant* result);
  // Stops the haptic device.
  bool StopDevice(const NPVariant* args, uint32_t arg_count,
                  NPVariant* result);
  // Sends force to the haptic device.
  bool SendForce(const NPVariant* args, uint32_t arg_count,
                 NPVariant* result);

  // Accessor/mutator for the debug property.
  bool GetDebug(NPVariant* value);
  bool SetDebug(const NPVariant* value);

  // Position accessor.
  bool GetPosition(NPVariant* value);

 private:
  NPP npp_;

  static NPIdentifier id_debug;
  static NPIdentifier id_position;
  static NPIdentifier id_start_device;
  static NPIdentifier id_stop_device;
  static NPIdentifier id_send_force;

  static std::map<NPIdentifier, MethodSelector>* method_table;
  static std::map<NPIdentifier, GetPropertySelector>* get_property_table;
  static std::map<NPIdentifier, SetPropertySelector>* set_property_table;
};

}  // namespace haptics

#endif  // SCRIPTING_BRIDGE_H_