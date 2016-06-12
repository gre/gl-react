const isAnimated = require("./isAnimated");

// At the moment, need to dup some things from RN Animated

class Animated {
  __attach () {}
  __detach () {}
  __getValue () {}
  __getAnimatedValue () { return this.__getValue(); }
  __addChild () {}
  __removeChild () {}
  __getChildren () { return []; }
}

class AnimatedWithChildren extends Animated {
  constructor () {
    super();
    this._children = [];
  }
  __addChild (child) {
    if (this._children.length === 0) {
      this.__attach();
    }
    this._children.push(child);
  }
  __removeChild (child) {
    var index = this._children.indexOf(child);
    if (index === -1) {
      console.warn("Trying to remove a child that doesn't exist");
      return;
    }
    this._children.splice(index, 1);
    if (this._children.length === 0) {
      this.__detach();
    }
  }
  __getChildren () {
    return this._children;
  }
}

// Animated over the GL Data uniforms object
class AnimatedUniforms extends AnimatedWithChildren {
  constructor (uniforms) {
    super();
    this._uniforms = uniforms;
    this.__attach();
  }

  __getValue() {
    const u = {};
    const uniforms = this._uniforms;
    for (let key in uniforms) {
      let value = uniforms[key];
      if (value instanceof Array) {
        let arr = [];
        for (let i = 0; i < value.length; i++) {
          let v = value[i];
          arr[i] = isAnimated(v) ? v.__getValue() : v;
        }
        u[key] = arr;
      }
      else if (isAnimated(value)) {
        u[key] = value.__getValue();
      }
      else {
        u[key] = value;
      }
    }
    return u;
  }

  __attach() {
    const uniforms = this._uniforms;
    for (let key in uniforms) {
      let value = uniforms[key];
      if (value instanceof Array) {
        for (let i = 0; i < value.length; i++) {
          let v = value[i];
          if (isAnimated(v)) {
            v.__addChild(this);
          }
        }
      }
      else if (isAnimated(value)) {
        value.__addChild(this);
      }
    }
  }

  __detach() {
    const uniforms = this._uniforms;
    for (let key in uniforms) {
      let value = uniforms[key];
      if (value instanceof Array) {
        for (let i = 0; i < value.length; i++) {
          let v = value[i];
          if (isAnimated(v)) {
            v.__removeChild(this);
          }
        }
      }
      else if (isAnimated(value)) {
        value.__removeChild(this);
      }
    }
  }
}

// Animated over a GL Data
class AnimatedData extends AnimatedWithChildren {
  constructor (data, callback) {
    super();
    this._data = {
      ...data,
      contextChildren: data.contextChildren.map(d => new AnimatedData(d)),
      children: data.children.map(d => new AnimatedData(d)),
      uniforms: new AnimatedUniforms(data.uniforms)
    };
    if (callback) this.update = callback;
    this.__attach();
  }

  __getValue() {
    const { ...data, contextChildren, width, height, children, uniforms } = this._data;
    data.width = isAnimated(width) ? width.__getValue() : width;
    data.height = isAnimated(height) ? height.__getValue() : height;
    data.contextChildren = contextChildren.map(c => c.__getValue());
    data.children = children.map(c => c.__getValue());
    data.uniforms = uniforms.__getValue();
    return data;
  }

  __attach() {
    const { contextChildren, children, uniforms, width, height } = this._data;
    if (isAnimated(width)) width.__addChild(this);
    if (isAnimated(height)) height.__addChild(this);
    contextChildren.forEach(c => c.__addChild(this));
    children.forEach(c => c.__addChild(this));
    uniforms.__addChild(this);
  }

  __detach() {
    const { contextChildren, children, uniforms, width, height } = this._data;
    if (isAnimated(width)) width.__removeChild(this);
    if (isAnimated(height)) height.__removeChild(this);
    contextChildren.forEach(c => c.__removeChild(this));
    children.forEach(c => c.__removeChild(this));
    uniforms.__removeChild(this);
  }
}

module.exports = AnimatedData;
