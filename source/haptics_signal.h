// Copyright 2010 Mohamed Mansour. All rights reserved.
// Use of this source code is governed by a GPL license that can
// be found in the LICENSE file.

#ifndef HAPTICS_SIGNAL_H_
#define HAPTICS_SIGNAL_H_
#pragma once

typedef void* hpointer;

namespace haptics_device {

// The result of using these macros is that the code will be more readable and
// regular. Making the header declaration easier to read and maintain.
#define HAPTIC_CALLBACK(CLASS, RETURN, METHOD)        \
  static RETURN METHOD ## Thunk(hpointer data) {      \
    return reinterpret_cast<CLASS*>(data)->METHOD();  \
  }                                                   \
                                                      \
  virtual RETURN METHOD();

}  // namespace device

#endif  // HAPTICS_SIGNAL_H_