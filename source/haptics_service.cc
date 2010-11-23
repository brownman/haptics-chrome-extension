// Copyright 2010 Mohamed Mansour. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE file.

#include "haptics_service.h"

#include "scripting_bridge.h"

using haptics::ScriptingBridge;
using haptics::HapticsDevice;

namespace haptics {

HapticsService::HapticsService(NPP npp)
    : npp_(npp),
      scriptable_object_(NULL),
      device_(NULL),
      debug_(false) {
  ScriptingBridge::InitializeIdentifiers();

  NPObject* window = NULL;
  NPN_GetValue(npp_, NPNVWindowNPObject, &window_object_);

  device_ = new HapticsDevice();
}

HapticsService::~HapticsService() {
  if (scriptable_object_)
    NPN_ReleaseObject(scriptable_object_);

  if (window_object_)
    NPN_ReleaseObject(window_object_);

  if (device_) {
    delete device_;
    device_ = NULL;
  }
}

NPObject* HapticsService::GetScriptableObject() {
  if (scriptable_object_ == NULL)
    scriptable_object_ = NPN_CreateObject(npp_, &ScriptingBridge::np_class);

  if (scriptable_object_)
    NPN_RetainObject(scriptable_object_);

  return scriptable_object_;
}

bool HapticsService::SendForce(NPObject* force_object) {
  SendConsole("SetForce::BEGIN");
  NPVariant length_variant;
  NPN_GetProperty(npp_,
                  force_object,
                  NPN_GetStringIdentifier("length"),
                  &length_variant);
  int length = NPVARIANT_TO_INT32(length_variant);
  if (length != 3)
    return false;

  double force[3];
  for (int i = 0; i < 3; i++) {
    NPVariant val;
    NPN_GetProperty(npp_, force_object, NPN_GetIntIdentifier(i), &val);
    force[i] = NPVARIANT_TO_DOUBLE(val);
  }
  device_->SendForce(force);
  return true;
}

bool HapticsService::StartDevice(NPVariant* result_variant) {
  SendConsole("StartDevice::BEGIN");
  device_->StartDevice();
  GetInitialized(result_variant);
  return true;
}

bool HapticsService::StopDevice(NPVariant* result_variant) {
  SendConsole("StopDevice::BEGIN");
  device_->StopDevice();
  GetInitialized(result_variant);
  return true;
}

void HapticsService::SendConsole(const char* message) {
  if (!debug_)
    return;

  // Get console object.
  NPVariant consoleVar;
  NPIdentifier id = NPN_GetStringIdentifier("console");
  NPN_GetProperty(npp_, window_object_, id, &consoleVar);
  NPObject* console = NPVARIANT_TO_OBJECT(consoleVar);

  // Get the debug object.
  id = NPN_GetStringIdentifier("debug");

  // Invoke the call with the message!
  NPVariant type;
  STRINGZ_TO_NPVARIANT(message, type);
  NPVariant args[] = { type };
  NPVariant voidResponse;
  NPN_Invoke(npp_, console, id, args,
             sizeof(args) / sizeof(args[0]),
             &voidResponse);

  // Cleanup all allocated objects, otherwise, reference count and
  // memory leaks will happen.
  NPN_ReleaseVariantValue(&consoleVar);
  NPN_ReleaseVariantValue(&voidResponse);
}


void HapticsService::GetPosition(NPVariant* position_variant) {
  SendConsole("GetPosition::BEGIN");
  // Initialize the return value.
  NULL_TO_NPVARIANT(*position_variant);
  NPVariant variant;
  NPString npstr;
  npstr.UTF8Characters = "new Array();";
  npstr.UTF8Length = static_cast<uint32_t>(strlen(npstr.UTF8Characters));
  if (!NPN_Evaluate(npp_, window_object_, &npstr, &variant) ||
      !NPVARIANT_IS_OBJECT(variant)) {
    return;
  }

  // Get the current device position.
  double pos[3];
  device_->GetPosition(pos);

  // Set the properties for the position on the array.
  NPObject* object = NPVARIANT_TO_OBJECT(variant);
  if (object) {
    NPVariant value;
    DOUBLE_TO_NPVARIANT(pos[0], value);
    NPN_SetProperty(npp_, object, NPN_GetIntIdentifier(0), &value);
    DOUBLE_TO_NPVARIANT(pos[1], value);
    NPN_SetProperty(npp_, object, NPN_GetIntIdentifier(1), &value);
    DOUBLE_TO_NPVARIANT(pos[2], value);
    NPN_SetProperty(npp_, object, NPN_GetIntIdentifier(2), &value);
    OBJECT_TO_NPVARIANT(object, *position_variant);
  }
}

void HapticsService::GetInitialized(NPVariant* initialized_variant) {
  BOOLEAN_TO_NPVARIANT(device_->initialized(), *initialized_variant);
}

}  // namespace desktop_service
