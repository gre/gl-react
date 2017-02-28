
<img width="32" alt="icon" src="https://cloud.githubusercontent.com/assets/211411/9813786/eacfcc24-5888-11e5-8f9b-5a907a2cbb21.png"> gl-react-native
========

`gl-react-native` is the [React Native](https://facebook.github.io/react-native/) standalone implementation of [gl-react](https://github.com/gre/gl-react), library to write and compose WebGL shaders. If you are using Exponent, it is recommended to use `gl-react-exponent` instead.

This implementation is a standalone fork of Exponent GLView (MIT License) available on
https://github.com/exponent/exponent and https://github.com/exponent/exponent-sdk.
Huge kudos to Exponent team and especially [@nikki93](https://github.com/nikki93) for implementing it.

## Links

- [Github](https://github.com/gre/gl-react)
- [Cookbook, examples, API](https://gl-react-cookbook.surge.sh)
- [![Join the chat at https://gitter.im/gl-react/Lobby](https://badges.gitter.im/gl-react/Lobby.svg)](https://gitter.im/gl-react/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Install


### Configure your React Native Application

**on iOS:**

![](install-steps.png)

**on Android:**

1. `android/settings.gradle`:: Add the following snippet
```gradle
include ':RNGL'
project(':RNGL').projectDir = file('../node_modules/gl-react-native/android')
```
2. `android/app/build.gradle`: Add in dependencies block.
```gradle
compile project(':RNGL')
```
3. in your `MainApplication` (or equivalent) the RNGLPackage needs to be added. Add the import at the top:
```java
import fr.greweb.rngl.RNGLPackage;
```
4. In order for React Native to use the package, add it the packages inside of the class extending ReactActivity.
```java
@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
	new MainReactPackage(),
	...
	new RNGLPackage()
  );
}
```

also make sure you have configured Android NDK. You will need it to compile the Native C++ code.
