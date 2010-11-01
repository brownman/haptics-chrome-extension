// Copyright 2010 Mohamed Mansour. All rights reserved.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE file.

#include "haptics_service.h"

#include "scripting_bridge.h"

using haptics::ScriptingBridge;
using haptics::HapticsDevice;

namespace haptics {

HapticsService::HapticsService(NPP npp, NPNetscapeFuncs* npfuncs)
    : npp_(npp),
      scriptable_object_(NULL),
      npfuncs_(npfuncs),
      device_(NULL),
      debug_(false) {
  ScriptingBridge::InitializeIdentifiers(npfuncs);
  device_ = new HapticsDevice();
}

HapticsService::~HapticsService() {
  if (scriptable_object_)
    npfuncs_->releaseobject(scriptable_object_);

  if (device_) {
    delete device_;
    device_ = NULL;
  }
}

NPObject* HapticsService::GetScriptableObject() {
  if (scriptable_object_ == NULL) {
    scriptable_object_ =
        npfuncs_->createobject(npp_, &ScriptingBridge::np_class);
  }
  if (scriptable_object_)
    npfuncs_->retainobject(scriptable_object_);
  return scriptable_object_;
}

bool HapticsService::SendForce(NPObject* force_object) {
  SendConsole("SetForce::BEGIN");
  NPVariant length_variant;
  npfuncs_->getproperty(npp_,
                        force_object,
                        npfuncs_->getstringidentifier("length"),
                        &length_variant);
  int length = NPVARIANT_TO_INT32(length_variant);
  if (length != 3)
    return false;

  double force[3];
  for (int i = 0; i < 3; i++) {
    NPVariant val;
    npfuncs_->getproperty(npp_,
                          force_object,
                          npfuncs_->getintidentifier(i),
                          &val);
    force[i] = NPVARIANT_TO_DOUBLE(val);
  }
  device_->SendForce(force);
  return true;
}

bool HapticsService::StartDevice() {
  SendConsole("StartDevice::BEGIN");
  device_->StartDevice();
  return true;
}

bool HapticsService::StopDevice() {
  SendConsole("StopDevice::BEGIN");
  device_->StopDevice();
  return true;
}


void HapticsService::SendConsole(const char* message) {
  if (!debug_)
    return;

  // Get window object.
  NPObject* window = NULL;
  npfuncs_->getvalue(npp_, NPNVWindowNPObject, &window);

  // Get console object.
  NPVariant consoleVar;
  NPIdentifier id = npfuncs_->getstringidentifier("console");
  npfuncs_->getproperty(npp_, window, id, &consoleVar);
  NPObject* console = NPVARIANT_TO_OBJECT(consoleVar);

  // Get the debug object.
  id = npfuncs_->getstringidentifier("debug");

  // Invoke the call with the message!
  NPVariant type;
  STRINGZ_TO_NPVARIANT(message, type);
  NPVariant args[] = { type };
  NPVariant voidResponse;
  npfuncs_->invoke(npp_, console, id, args,
                   sizeof(args) / sizeof(args[0]),
                   &voidResponse);

  // Cleanup all allocated objects, otherwise, reference count and
  // memory leaks will happen.
  npfuncs_->releaseobject(window);
  npfuncs_->releasevariantvalue(&consoleVar);
  npfuncs_->releasevariantvalue(&voidResponse);
}

}  // namespace desktop_service
