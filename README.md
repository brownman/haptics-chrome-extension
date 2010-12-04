Haptics Chrome
=====================================

This Google Chrome extension adds haptics support to Google Chrome. Allows the
web to send touch events to the device so that the user can feel what is happening.

Ultimate goal is to integrate Haptics as a device within HTML5's device API. It
will help people with disability to access the web better through the sense of 
touch. The browser will be able send events to the device so that the user can
feel the geometry of the website (sections, images, video, text). 

Another goal is to allow WebGL content be accessibile through the device, can 
assist the blind feeling objects available in WebGL, and allow gamers to place
a touch interaction to their gameplay (feel gravity, weight, force feedback, 
feels different texture, etc).
 

How does it work?
----------------
The NPAPI plugin interacts with the device and allows the webapp to interact with
it through a set of API's.

The API:

 Implemented
  
    void startDevice();
    void stopDevice();
    void sendForce(double[3]);
    double[3] position;
    boolean initialized;


How to debug?
-------------
You can debug the extension's Native (NPAPI) instance by setting a property 
for the plugin, it will spit out console messages to the background page:
 
    app.debug = true;

Screenshots
------------
![Screenshot of the Chrome Extension](https://github.com/mohamedmansour/haptics-chrome-extension/raw/master/screenshot/screenshot_simple.png)
![Screenshot of the Chrome Extension](https://github.com/mohamedmansour/haptics-chrome-extension/raw/master/screenshot/screenshot_multiple.png)


License
-------------
Please refer to the LICENSE file, GPL

Mohamed Mansour hello@mohamedmansour.com