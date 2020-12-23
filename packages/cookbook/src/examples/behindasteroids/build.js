/* eslint-disable */
module.exports = function (d, g, RENDER_CB) {
  var raf;
  var DEBUG = true; // eslint-disable-line no-unused-vars
  var MOBILE = "ontouchstart" in document; // eslint-disable-line no-unused-vars

  // normalize radian angle between -PI and PI (assuming it is not too far)
  function normAngle(a) {
    return a < -Math.PI ? a + 2 * Math.PI : a > Math.PI ? a - 2 * Math.PI : a;
  }

  function smoothstep(min, max, value) {
    var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  function scoreTxt(s) {
    return (s <= 9 ? "0" : "") + s;
  }

  function dist(a, b) {
    var x = a[0] - b[0];
    var y = a[1] - b[1];
    return Math.sqrt(x * x + y * y);
  }

  function length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  function circleCollides(a, b, r) {
    var x = a[0] - b[0];
    var y = a[1] - b[1];
    return x * x + y * y < r * r;
  }
  /* global ctx */

  function path(pts, noclose) {
    // eslint-disable-line no-unused-vars
    ctx.beginPath();
    var mv = 1;
    for (var i = 0; pts && i < pts.length; ++i) {
      var p = pts[i];
      if (p) {
        if (mv) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
        mv = 0;
      } else mv = 1;
    }
    if (!noclose) ctx.closePath();
  }
  /* global ctx, path */

  // implementing by hand Asteroid's font. see http://www.dafont.com/hyperspace.font

  var FONT0 = [
    // 0
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
    [0, 0],
  ];
  var FONT5 = [
    // 5
    [2, 0],
    [0, 0],
    [0, 1],
    [2, 1],
    [2, 2],
    [0, 2],
  ];
  var FONT = [
    FONT0,
    [
      // 1
      [1, 0],
      [1, 2],
    ],
    [
      // 2
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
      [0, 2],
      [2, 2],
    ],
    [
      // 3
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
      ,
      [0, 1],
      [2, 1],
    ],
    [
      // 4
      [0, 0],
      [0, 1],
      [2, 1],
      ,
      [2, 0],
      [2, 2],
    ],
    FONT5,
    [
      // 6
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 1],
      [0, 1],
    ],
    [
      // 7
      [0, 0],
      [2, 0],
      [2, 2],
    ],
    [
      // 8
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
      [0, 0],
      ,
      [0, 1],
      [2, 1],
    ],
    [
      // 9
      [2, 2],
      [2, 0],
      [0, 0],
      [0, 1],
      [2, 1],
    ],
  ];
  [
    [
      // A
      [0, 2],
      [0, 2 / 3],
      [1, 0],
      [2, 2 / 3],
      [2, 2],
      ,
      [0, 4 / 3],
      [2, 4 / 3],
    ],
    [
      // B
      [0, 1],
      [0, 0],
      [4 / 3, 0],
      [2, 1 / 3],
      [2, 2 / 3],
      [4 / 3, 1],
      [0, 1],
      [0, 2],
      [4 / 3, 2],
      [2, 5 / 3],
      [2, 4 / 3],
      [4 / 3, 1],
    ],
    [
      // C
      [2, 0],
      [0, 0],
      [0, 2],
      [2, 2],
    ],
    [
      // D
      [0, 0],
      [1, 0],
      [2, 2 / 3],
      [2, 4 / 3],
      [1, 2],
      [0, 2],
      [0, 0],
    ],
    [
      // E
      [2, 0],
      [0, 0],
      [0, 2],
      [2, 2],
      ,
      [0, 1],
      [1.5, 1],
    ],
    [
      // F
      [2, 0],
      [0, 0],
      [0, 2],
      ,
      [0, 1],
      [2, 1],
    ],
    [
      // G
      [2, 2 / 3],
      [2, 0],
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 4 / 3],
      [1, 4 / 3],
    ],
    [
      // H
      [0, 0],
      [0, 2],
      ,
      [2, 0],
      [2, 2],
      ,
      [0, 1],
      [2, 1],
    ],
    [
      // I
      [0, 0],
      [2, 0],
      ,
      [1, 0],
      [1, 2],
      ,
      [0, 2],
      [2, 2],
    ],
    [
      // J
      [2, 0],
      [2, 2],
      [1, 2],
      [0, 4 / 3],
    ],
    [
      // K
      [0, 0],
      [0, 2],
      ,
      [2, 0],
      [0, 1],
      [2, 2],
    ],
    [
      // L
      [0, 0],
      [0, 2],
      [2, 2],
    ],
    [
      // M
      [0, 2],
      [0, 0],
      [1, 2 / 3],
      [2, 0],
      [2, 2],
    ],
    [
      // N
      [0, 2],
      [0, 0],
      [2, 2],
      [2, 0],
    ],
    FONT0, // O
    [
      // P
      [0, 2],
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
    ],
    [
      // Q
      [0, 0],
      [2, 0],
      [2, 4 / 3],
      [1, 2],
      [0, 2],
      [0, 0],
      ,
      [2, 2],
      [1, 4 / 3],
    ],
    [
      // R
      [0, 2],
      [0, 0],
      [2, 0],
      [2, 1],
      [0, 1],
      [2, 2],
    ],
    FONT5, // S
    [
      // T
      [0, 0],
      [2, 0],
      ,
      [1, 0],
      [1, 2],
    ],
    [
      // U
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0],
    ],
    [
      // V
      [0, 0],
      [1, 2],
      [2, 0],
    ],
    [
      // W
      [0, 0],
      [0, 2],
      [1, 4 / 3],
      [2, 2],
      [2, 0],
    ],
    [
      // X
      [0, 0],
      [2, 2],
      ,
      [2, 0],
      [0, 2],
    ],
    [
      // Y
      [0, 0],
      [1, 2 / 3],
      [2, 0],
      ,
      [1, 2 / 3],
      [1, 2],
    ],
    [
      // Z
      [0, 0],
      [2, 0],
      [0, 2],
      [2, 2],
    ],
  ].forEach(function (c, i) {
    FONT[String.fromCharCode(65 + i)] = c;
  });

  var dot = (FONT["."] = [
    [1, 1.8],
    [1, 2],
  ]);

  FONT[":"] = [[1, 0], [1, 0.2], , [1, 1.8], [1, 2]];

  FONT["'"] = [
    [1, 0],
    [1, 2 / 3],
  ];

  FONT["ᐃ"] = [
    [1, 0],
    [1.8, 2],
    [1, 1.6],
    [0.2, 2],
    [1, 0],
    /*
  [-4, -4],
  [ 10, 0],
  [ -4, 4],
  [ -3, 0]
  */
  ];

  FONT["!"] = [[1, 0], [1, 1.5], ,].concat(dot);
  FONT["?"] = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 1.5], ,].concat(dot);
  FONT["x"] = [[0, 1], [2, 2], , [2, 1], [0, 2]];
  FONT["¢"] = [
    [1, 0],
    [1, 2],
    ,
    [1.5, 0.5],
    [0.5, 0.5],
    [0.5, 1.5],
    [1.5, 1.5],
  ];

  // oO ASTEROIDS font with fontSize and align (-1:right, 0:center, 1:left)
  // will side effect some ctx.translate() (that you could benefit to make text follow)
  function font(txt, fontSize, align) {
    // eslint-disable-line
    var l = fontSize * 11 * txt.length;
    ctx.translate(align ? (align > 0 ? 0 : -l) : -l / 2, 0);
    for (var i = 0; i < txt.length; i++) {
      path(
        FONT[txt[i]] &&
          FONT[txt[i]].map(function (o) {
            return o && [4 * fontSize * o[0], 5 * fontSize * o[1]];
          }),
        1
      );
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.translate(fontSize * 11, 0);
    }
  }
  /* global gl, W, H, DEBUG */

  function glCreateShader(vert, frag) {
    var handle,
      type = gl.VERTEX_SHADER,
      src = vert;
    handle = gl.createShader(type);
    gl.shaderSource(handle, src);
    gl.compileShader(handle);
    var vertex = handle;

    if (DEBUG) {
      if (!gl.getShaderParameter(handle, gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(handle);
    }

    type = gl.FRAGMENT_SHADER;
    src = frag;
    handle = gl.createShader(type);
    gl.shaderSource(handle, src);
    gl.compileShader(handle);
    var fragment = handle;

    if (DEBUG) {
      if (!gl.getShaderParameter(handle, gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(handle);
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (DEBUG) {
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw gl.getProgramInfoLog(program);
    }

    gl.useProgram(program);
    var p = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
    return [program];
  }
  function glBindShader(shader) {
    gl.useProgram(shader[0]);
  }
  function glUniformLocation(shader, name) {
    return (
      shader[name] || (shader[name] = gl.getUniformLocation(shader[0], name))
    );
  }
  function glCreateTexture() {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }
  function glSetTexture(t, value) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, value);
  }
  function glBindTexture(t, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    return unit;
  }
  function glCreateFBO() {
    var handle = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, handle);
    var color = glCreateTexture();
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      W,
      H,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      color,
      0
    );
    return [handle, color];
  }
  function glBindFBO(fbo) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[0]);
  }
  function glGetFBOTexture(fbo) {
    return fbo[1];
  }
  /**
   * SfxrParams
   *
   * Copyright 2010 Thomas Vian
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * @author Thomas Vian
   */

  /* eslint-disable */

  /** @constructor */
  function SfxrParams() {
    //--------------------------------------------------------------------------
    //
    //  Settings String Methods
    //
    //--------------------------------------------------------------------------

    /**
     * Parses a settings array into the parameters
     * @param array Array of the settings values, where elements 0 - 23 are
     *                a: waveType
     *                b: attackTime
     *                c: sustainTime
     *                d: sustainPunch
     *                e: decayTime
     *                f: startFrequency
     *                g: minFrequency
     *                h: slide
     *                i: deltaSlide
     *                j: vibratoDepth
     *                k: vibratoSpeed
     *                l: changeAmount
     *                m: changeSpeed
     *                n: squareDuty
     *                o: dutySweep
     *                p: repeatSpeed
     *                q: phaserOffset
     *                r: phaserSweep
     *                s: lpFilterCutoff
     *                t: lpFilterCutoffSweep
     *                u: lpFilterResonance
     *                v: hpFilterCutoff
     *                w: hpFilterCutoffSweep
     *                x: masterVolume
     * @return If the string successfully parsed
     */
    this.ss = function (values) {
      for (var i = 0; i < 24; i++) {
        this[String.fromCharCode(97 + i)] = values[i] || 0;
      }

      // I moved this here from the r(true) function
      if (this["c"] < 0.01) {
        this["c"] = 0.01;
      }

      var totalTime = this["b"] + this["c"] + this["e"];
      if (totalTime < 0.18) {
        var multiplier = 0.18 / totalTime;
        this["b"] *= multiplier;
        this["c"] *= multiplier;
        this["e"] *= multiplier;
      }
    };
  }

  /**
   * SfxrSynth
   *
   * Copyright 2010 Thomas Vian
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * @author Thomas Vian
   */
  /** @constructor */
  function SfxrSynth() {
    // All variables are kept alive through function closures

    //--------------------------------------------------------------------------
    //
    //  Sound Parameters
    //
    //--------------------------------------------------------------------------

    this._p = new SfxrParams(); // Params instance

    //--------------------------------------------------------------------------
    //
    //  Synth Variables
    //
    //--------------------------------------------------------------------------

    var _envelopeLength0, // Length of the attack stage
      _envelopeLength1, // Length of the sustain stage
      _envelopeLength2, // Length of the decay stage
      _period, // Period of the wave
      _maxPeriod, // Maximum period before sound stops (from minFrequency)
      _slide, // Note slide
      _deltaSlide, // Change in slide
      _changeAmount, // Amount to change the note by
      _changeTime, // Counter for the note change
      _changeLimit, // Once the time reaches this limit, the note changes
      _squareDuty, // Offset of center switching point in the square wave
      _dutySweep; // Amount to change the duty by

    //--------------------------------------------------------------------------
    //
    //  Synth Methods
    //
    //--------------------------------------------------------------------------

    /**
     * rs the runing variables from the params
     * Used once at the start (total r) and for the repeat effect (partial r)
     */
    this.r = function () {
      // Shorter reference
      var p = this._p;

      _period = 100 / (p["f"] * p["f"] + 0.001);
      _maxPeriod = 100 / (p["g"] * p["g"] + 0.001);

      _slide = 1 - p["h"] * p["h"] * p["h"] * 0.01;
      _deltaSlide = -p["i"] * p["i"] * p["i"] * 0.000001;

      if (!p["a"]) {
        _squareDuty = 0.5 - p["n"] / 2;
        _dutySweep = -p["o"] * 0.00005;
      }

      _changeAmount = 1 + p["l"] * p["l"] * (p["l"] > 0 ? -0.9 : 10);
      _changeTime = 0;
      _changeLimit = p["m"] == 1 ? 0 : (1 - p["m"]) * (1 - p["m"]) * 20000 + 32;
    };

    // I split the r() function into two functions for better readability
    this.tr = function () {
      this.r();

      // Shorter reference
      var p = this._p;

      // Calculating the length is all that remained here, everything else moved somewhere
      _envelopeLength0 = p["b"] * p["b"] * 100000;
      _envelopeLength1 = p["c"] * p["c"] * 100000;
      _envelopeLength2 = p["e"] * p["e"] * 100000 + 12;
      // Full length of the volume envelop (and therefore sound)
      // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
      return (
        (((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3) | 0) * 3
      );
    };

    /**
     * Writes the wave to the supplied buffer ByteArray
     * @param buffer A ByteArray to write the wave to
     * @return If the wave is finished
     */
    this.sw = function (buffer, length) {
      // Shorter reference
      var p = this._p;

      // If the filters are active
      var _filters = p["s"] != 1 || p["v"],
        // Cutoff multiplier which adjusts the amount the wave position can move
        _hpFilterCutoff = p["v"] * p["v"] * 0.1,
        // Speed of the high-pass cutoff multiplier
        _hpFilterDeltaCutoff = 1 + p["w"] * 0.0003,
        // Cutoff multiplier which adjusts the amount the wave position can move
        _lpFilterCutoff = p["s"] * p["s"] * p["s"] * 0.1,
        // Speed of the low-pass cutoff multiplier
        _lpFilterDeltaCutoff = 1 + p["t"] * 0.0001,
        // If the low pass filter is active
        _lpFilterOn = p["s"] != 1,
        // masterVolume * masterVolume (for quick calculations)
        _masterVolume = p["x"] * p["x"],
        // Minimum frequency before stopping
        _minFreqency = p["g"],
        // If the phaser is active
        _phaser = p["q"] || p["r"],
        // Change in phase offset
        _phaserDeltaOffset = p["r"] * p["r"] * p["r"] * 0.2,
        // Phase offset for phaser effect
        _phaserOffset = p["q"] * p["q"] * (p["q"] < 0 ? -1020 : 1020),
        // Once the time reaches this limit, some of the    iables are r
        _repeatLimit = p["p"]
          ? (((1 - p["p"]) * (1 - p["p"]) * 20000) | 0) + 32
          : 0,
        // The punch factor (louder at begining of sustain)
        _sustainPunch = p["d"],
        // Amount to change the period of the wave by at the peak of the vibrato wave
        _vibratoAmplitude = p["j"] / 2,
        // Speed at which the vibrato phase moves
        _vibratoSpeed = p["k"] * p["k"] * 0.01,
        // The type of wave to generate
        _waveType = p["a"];

      var _envelopeLength = _envelopeLength0, // Length of the current envelope stage
        _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
        _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
        _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)

      // Damping muliplier which restricts how fast the wave position can move
      var _lpFilterDamping =
        (5 / (1 + p["u"] * p["u"] * 20)) * (0.01 + _lpFilterCutoff);
      if (_lpFilterDamping > 0.8) {
        _lpFilterDamping = 0.8;
      }
      _lpFilterDamping = 1 - _lpFilterDamping;

      var _finished = false, // If the sound has finished
        _envelopeStage = 0, // Current stage of the envelope (attack, sustain, decay, end)
        _envelopeTime = 0, // Current time through current enelope stage
        _envelopeVolume = 0, // Current volume of the envelope
        _hpFilterPos = 0, // Adjusted wave position after high-pass filter
        _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
        _lpFilterOldPos, // Previous low-pass wave position
        _lpFilterPos = 0, // Adjusted wave position after low-pass filter
        _periodTemp, // Period modified by vibrato
        _phase = 0, // Phase through the wave
        _phaserInt, // Integer phaser offset, for bit maths
        _phaserPos = 0, // Position through the phaser buffer
        _pos, // Phase expresed as a Number from 0-1, used for fast sin approx
        _repeatTime = 0, // Counter for the repeats
        _sample, // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
        _superSample, // Actual sample writen to the wave
        _vibratoPhase = 0; // Phase through the vibrato sine wave

      // Buffer of wave values used to create the out of phase second wave
      var _phaserBuffer = new Array(1024),
        // Buffer of random values used to generate noise
        _noiseBuffer = new Array(32);
      for (var i = _phaserBuffer.length; i--; ) {
        _phaserBuffer[i] = 0;
      }
      for (var i = _noiseBuffer.length; i--; ) {
        _noiseBuffer[i] = Math.random() * 2 - 1;
      }

      for (var i = 0; i < length; i++) {
        if (_finished) {
          return i;
        }

        // Repeats every _repeatLimit times, partially rting the sound parameters
        if (_repeatLimit) {
          if (++_repeatTime >= _repeatLimit) {
            _repeatTime = 0;
            this.r();
          }
        }

        // If _changeLimit is reached, shifts the pitch
        if (_changeLimit) {
          if (++_changeTime >= _changeLimit) {
            _changeLimit = 0;
            _period *= _changeAmount;
          }
        }

        // Acccelerate and apply slide
        _slide += _deltaSlide;
        _period *= _slide;

        // Checks for frequency getting too low, and stops the sound if a minFrequency was set
        if (_period > _maxPeriod) {
          _period = _maxPeriod;
          if (_minFreqency > 0) {
            _finished = true;
          }
        }

        _periodTemp = _period;

        // Applies the vibrato effect
        if (_vibratoAmplitude > 0) {
          _vibratoPhase += _vibratoSpeed;
          _periodTemp *= 1 + Math.sin(_vibratoPhase) * _vibratoAmplitude;
        }

        _periodTemp |= 0;
        if (_periodTemp < 8) {
          _periodTemp = 8;
        }

        // Sweeps the square duty
        if (!_waveType) {
          _squareDuty += _dutySweep;
          if (_squareDuty < 0) {
            _squareDuty = 0;
          } else if (_squareDuty > 0.5) {
            _squareDuty = 0.5;
          }
        }

        // Moves through the different stages of the volume envelope
        if (++_envelopeTime > _envelopeLength) {
          _envelopeTime = 0;

          switch (++_envelopeStage) {
            case 1:
              _envelopeLength = _envelopeLength1;
              break;
            case 2:
              _envelopeLength = _envelopeLength2;
          }
        }

        // Sets the volume based on the position in the envelope
        switch (_envelopeStage) {
          case 0:
            _envelopeVolume = _envelopeTime * _envelopeOverLength0;
            break;
          case 1:
            _envelopeVolume =
              1 +
              (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
            break;
          case 2:
            _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
            break;
          case 3:
            _envelopeVolume = 0;
            _finished = true;
        }

        // Moves the phaser offset
        if (_phaser) {
          _phaserOffset += _phaserDeltaOffset;
          _phaserInt = _phaserOffset | 0;
          if (_phaserInt < 0) {
            _phaserInt = -_phaserInt;
          } else if (_phaserInt > 1023) {
            _phaserInt = 1023;
          }
        }

        // Moves the high-pass filter cutoff
        if (_filters && _hpFilterDeltaCutoff) {
          _hpFilterCutoff *= _hpFilterDeltaCutoff;
          if (_hpFilterCutoff < 0.00001) {
            _hpFilterCutoff = 0.00001;
          } else if (_hpFilterCutoff > 0.1) {
            _hpFilterCutoff = 0.1;
          }
        }

        _superSample = 0;
        for (var j = 8; j--; ) {
          // Cycles through the period
          _phase++;
          if (_phase >= _periodTemp) {
            _phase %= _periodTemp;

            // Generates new random noise for this period
            if (_waveType == 3) {
              for (var n = _noiseBuffer.length; n--; ) {
                _noiseBuffer[n] = Math.random() * 2 - 1;
              }
            }
          }

          // Gets the sample from the oscillator
          switch (_waveType) {
            case 0: // Square wave
              _sample = _phase / _periodTemp < _squareDuty ? 0.5 : -0.5;
              break;
            case 1: // Saw wave
              _sample = 1 - (_phase / _periodTemp) * 2;
              break;
            case 2: // Sine wave (fast and accurate approx)
              _pos = _phase / _periodTemp;
              _pos = (_pos > 0.5 ? _pos - 1 : _pos) * 6.28318531;
              _sample =
                1.27323954 * _pos +
                0.405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
              _sample =
                0.225 * ((_sample < 0 ? -1 : 1) * _sample * _sample - _sample) +
                _sample;
              break;
            case 3: // Noise
              _sample =
                _noiseBuffer[Math.abs(((_phase * 32) / _periodTemp) | 0)];
          }

          // Applies the low and high pass filters
          if (_filters) {
            _lpFilterOldPos = _lpFilterPos;
            _lpFilterCutoff *= _lpFilterDeltaCutoff;
            if (_lpFilterCutoff < 0) {
              _lpFilterCutoff = 0;
            } else if (_lpFilterCutoff > 0.1) {
              _lpFilterCutoff = 0.1;
            }

            if (_lpFilterOn) {
              _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
              _lpFilterDeltaPos *= _lpFilterDamping;
            } else {
              _lpFilterPos = _sample;
              _lpFilterDeltaPos = 0;
            }

            _lpFilterPos += _lpFilterDeltaPos;

            _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
            _hpFilterPos *= 1 - _hpFilterCutoff;
            _sample = _hpFilterPos;
          }

          // Applies the phaser effect
          if (_phaser) {
            _phaserBuffer[_phaserPos % 1024] = _sample;
            _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
            _phaserPos++;
          }

          _superSample += _sample;
        }

        // Averages out the super samples and applies volumes
        _superSample *= 0.125 * _envelopeVolume * _masterVolume;

        // Clipping if too loud
        buffer[i] =
          _superSample >= 1
            ? 32767
            : _superSample <= -1
            ? -32768
            : (_superSample * 32767) | 0;
      }

      return length;
    };
  }

  // Adapted from http://codebase.es/riffwave/
  var synth = new SfxrSynth();
  // Export for the Closure Compiler
  function jsfxr(settings, audioCtx, cb) {
    // Initialize SfxrParams
    synth._p.ss(settings);
    // Synthesize Wave
    var envelopeFullLength = synth.tr();
    var data = new Uint8Array((((envelopeFullLength + 1) / 2) | 0) * 4 + 44);

    var used =
      synth.sw(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;

    var dv = new Uint32Array(data.buffer, 0, 44);
    // Initialize header
    dv[0] = 0x46464952; // "RIFF"
    dv[1] = used + 36; // put total size here
    dv[2] = 0x45564157; // "WAVE"
    dv[3] = 0x20746d66; // "fmt "
    dv[4] = 0x00000010; // size of the following
    dv[5] = 0x00010001; // Mono: 1 channel, PCM format
    dv[6] = 0x0000ac44; // 44,100 samples per second
    dv[7] = 0x00015888; // byte rate: two bytes per sample
    dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
    dv[9] = 0x61746164; // "data"
    dv[10] = used; // put number of samples here

    // Base64 encoding written by me, @maettig
    used += 44;
    var i = 0,
      base64Characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      output = "data:audio/wav;base64,";
    for (; i < used; i += 3) {
      var a = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      output +=
        base64Characters[a >> 18] +
        base64Characters[(a >> 12) & 63] +
        base64Characters[(a >> 6) & 63] +
        base64Characters[a & 63];
    }

    audioCtx && audioCtx.decodeAudioData(data.buffer, cb);

    return output;
  }
  /* global jsfxr */

  var audioCtx, audioDest, audio, play; // eslint-disable-line

  var AudioContext = window.AudioContext || window.webkitAudioContext;

  if (AudioContext) {
    audioCtx = new AudioContext();
    audioDest = audioCtx.createDynamicsCompressor();
    var gain = audioCtx.createGain();
    gain.gain.value = 0.1;
    audioDest.connect(gain);
    gain.connect(audioCtx.destination);

    audio = function (conf) {
      // eslint-disable-line no-unused-vars
      var o = [];
      jsfxr(conf, audioCtx, function (buf) {
        o.push(buf);
      });
      return o;
    };
    play = function (o) {
      // eslint-disable-line no-unused-vars
      if (!o[0]) return;
      var source = audioCtx.createBufferSource();
      source.buffer = o[0];
      source.start(0);
      source.connect(audioDest);
      setTimeout(function () {
        source.disconnect(audioDest);
      }, o[0].duration * 1000 + 300);
    };
  } else {
    audio = play = function () {};
  }
  var BLUR1D_FRAG =
    "precision highp float;varying vec2 uv;uniform sampler2D t;uniform vec2 dim;uniform vec2 dir;void main(){vec4 a=vec4(0.0);vec2 b=vec2(1.3846153846)*dir;vec2 c=vec2(3.2307692308)*dir;a+=texture2D(t,uv)*0.2270270270;a+=texture2D(t,uv+(b/dim))*0.3162162162;a+=texture2D(t,uv-(b/dim))*0.3162162162;a+=texture2D(t,uv+(c/dim))*0.0702702703;a+=texture2D(t,uv-(c/dim))*0.0702702703;gl_FragColor=a;}";
  var COPY_FRAG =
    "precision highp float;varying vec2 uv;uniform sampler2D t;void main(){gl_FragColor=texture2D(t,uv);}";
  var GAME_FRAG =
    "precision highp float;varying vec2 uv;uniform sampler2D G;uniform sampler2D R;uniform sampler2D B;uniform sampler2D L;uniform sampler2D E;uniform float s;uniform float F;uniform vec2 k;float a(vec2 b,vec2 c){float d=10.0;vec2 e=b-c;return pow(abs(pow(abs(e.x),d)+pow(abs(e.y),d)),1.0/d);}void main(){vec2 f=uv+k;vec2 g=(f/0.98)-0.01;float h=a(f,vec2(0.5));float i=smoothstep(0.45,0.51,h);g=mix(g,vec2(0.5),0.2*(0.6-h)-0.02*h);vec3 j=texture2D(G,g).rgb;gl_FragColor=step(0.0,f.x)*step(f.x,1.0)*step(0.0,f.y)*step(f.y,1.0)*vec4((vec3(0.03+0.1*F,0.04,0.05)+mix(vec3(0.05,0.1,0.15)-j,2.0*j,s)+s*(texture2D(L,g).rgb+vec3(0.3+F,0.6,1.0)*(texture2D(R,g).rgb+3.0*texture2D(B,g).rgb)+0.5*texture2D(E,g).rgb))*mix(1.0,smoothstep(1.0,0.0,i),0.6),1.0);}";
  var GLARE_FRAG =
    "precision highp float;varying vec2 uv;uniform sampler2D t;void main(){gl_FragColor=vec4(step(0.9,texture2D(t,uv).r));}";
  var LASER_FRAG =
    "precision highp float;varying vec2 uv;uniform sampler2D t;void main(){vec3 a=texture2D(t,uv).rgb;vec2 b=0.003*vec2(cos(47.0*uv.y),sin(67.0*uv.x));gl_FragColor=vec4(a.r+a.g+a.b+texture2D(t,uv+b).b);}";
  var PERSISTENCE_FRAG =
    "precision highp float;varying vec2 uv;uniform sampler2D t;uniform sampler2D r;void main(){vec3 a=texture2D(r,uv).rgb;gl_FragColor=vec4(a*(0.82-0.3*a.r*a.r)+texture2D(t,uv).rgb,1.0);}";
  var PLAYER_FRAG =
    "precision highp float;varying vec2 uv;uniform float pt;uniform float pl;uniform float S;uniform float ex;uniform float J;uniform float P;float a(vec2 b,vec2 c){return step(length((uv-b)/c),1.0);}float d(vec2 b,vec2 c,float e){vec2 f=(uv-b)/c;return step(pow(abs(f.x),e)+pow(abs(f.y),e),1.0);}vec3 g(){return 0.1+0.3*vec3(1.0,0.9,0.7)*smoothstep(0.4,0.1,distance(uv,vec2(0.2,1.2)))+0.4*vec3(0.8,0.6,1.0)*smoothstep(0.5,0.2,distance(uv,vec2(1.3,0.7)));}vec4 h(float e,float i){vec4 b=vec4(0.0);vec2 j=vec2(min(ex,1.0),mix(min(ex,1.0),min(ex-1.0,1.0),0.5));vec4 k=0.2+0.4*pow(abs(cos(4.*e+S)),2.0)*vec4(1.0,0.7,0.3,1.0);vec4 l=vec4(0.5,0.3,0.3,1.0);vec4 m=vec4(0.3*(1.0+cos(3.*e+6.*S)),0.2*(1.0+cos(7.*e+7.*S)),0.1+0.2*(1.0+sin(7.*e+8.*S)),1.0);float n=step(sin(9.0*e+S),0.0);float o=0.02+0.02*n*cos(e+S);float p=step(i,-0.01)+step(0.01,i);float q=(1.0-p)*step(0.0,pt);vec2 r=vec2(0.5)+J*vec2(0.0,0.2)+p*vec2(0.03*cos(4.0*pt+sin(pt)),0.05*abs(sin(3.0*pt)))+j*q*(1.0-P)*vec2(0.05*cos(pt*(1.0+0.1*sin(pt))),0.05*abs(sin(pt)));vec2 s=mix(r,vec2(0.5),0.5);r.x+=i;s.x+=i;b+=k*a(r,vec2(0.06,0.1));b*=1.0-(0.5+0.5*n)*a(r-vec2(0.0,0.04),vec2(0.03,0.01));b*=1.0-a(r+vec2(0.03,0.03),vec2(0.02,0.01));b*=1.0-a(r+vec2(-0.03,0.03),vec2(0.02,0.01));b*=1.0-0.6*a(r,vec2(0.01,0.02));b+=l*a(r+vec2(0.0,o),vec2(0.07,0.1+o));b+=q*(l+k)*a(s-vec2(-0.2+0.01*cos(5.0*pt),0.45-0.1*j.y*step(0.0,pt)*P*pow(abs(sin(8.0*pt*(1.0+0.2*cos(pt)))),4.0)),vec2(0.055,0.05));b+=q*(l+k)*a(s-vec2(0.2+0.01*cos(5.0*pt),0.45-0.1*j.x*step(2.0,pt)*P*pow(abs(cos(7.0*pt)),4.0)),vec2(0.055,0.05));b+=step(b.a,0.0)*(l+k)*d(r-vec2(0.0,0.10+0.02*n),vec2(0.05-0.01*n,0.03),4.0);vec2 t=vec2(0.16+0.04*sin(9.*e),0.27+0.02*cos(9.*e));b+=step(b.r+b.g+b.b,0.0)*m*step(1.0,d(r-vec2(0.0,0.35),t*(1.0-0.1*n),4.0)+a(r-vec2(0.0,0.35),t));return b;}void main(){float u=0.6+0.4*smoothstep(2.0,0.0,distance(pt,-2.0));vec4 b=vec4(0.0);b+=(1.0-smoothstep(-0.0,-5.0,pt))*h(pl+step(pt,0.0),-0.6*smoothstep(-1.,-5.,pt));b+=step(1.0,pl)*h(pl+step(pt,0.0)-1.0,2.0*smoothstep(-4.,-1.,pt));b*=1.0-1.3*distance(uv,vec2(0.5));gl_FragColor=vec4(u*mix(g(),b.rgb,clamp(b.a,0.0,1.0)),1.0);}";
  var STATIC_VERT =
    "attribute vec2 p;varying vec2 uv;void main(){gl_Position=vec4(p,0.0,1.0);uv=0.5*(p+1.0);}";
  /* global g d MOBILE
gameScale: true
glCreateFBO glCreateShader glCreateTexture glUniformLocation
STATIC_VERT
BLUR1D_FRAG
COPY_FRAG
GAME_FRAG
GLARE_FRAG
LASER_FRAG
PERSISTENCE_FRAG
PLAYER_FRAG
*/

  var ctx,
    gameCtx = g.getContext("2d"),
    FW = MOBILE ? 480 : 800,
    FH = MOBILE ? 660 : 680,
    GAME_MARGIN = MOBILE ? 50 : 120,
    GAME_Y_MARGIN = MOBILE ? 140 : GAME_MARGIN,
    GAME_INC_PADDING = MOBILE ? 40 : 80,
    W = FW - 2 * GAME_MARGIN,
    H = FH - 2 * GAME_Y_MARGIN,
    borderLength = 2 * (W + H + 2 * GAME_INC_PADDING),
    SEED = Math.random();

  // DOM setup

  d.style.webkitTransformOrigin = d.style.transformOrigin = "0 0";

  g.width = W;
  g.height = H;

  var uiScale = 1;

  function checkSize() {}
  /* global W H */

  // N.B: constants don't live here

  var t = 0,
    dt,
    spaceship = [W / 2, H / 2, 0, 0, 0], // [x, y, velx, vely, rot]
    asteroids = [], // array of [x, y, rot, vel, shape, lvl]
    ufos = [], // array of [x, y, vx, vy, timeBeforeShot]
    bullets = [], // array of [x, y, velx, vely, life, isAlien]
    incomingObjects = [], // array of: [pos, vel, ang, force, rotVel, shape, lvl, key, rotAmp, rotAmpValid, explodeTime]
    particles = [], // array of [x, y, rot, vel, life]
    dying = 0,
    resurrectionTime = 0,
    best = 0,
    score = 0, // current asteroids player score
    scoreForLife, // will track the next score to win a life (10000, 20000, ...)
    playingSince = -10000,
    deads = 0,
    player = 0,
    lifes = 0,
    AIshoot = 0,
    AIboost = 0,
    AIrotate = 0,
    AIexcitement = 0,
    AIboostSmoothed = 0,
    shaking = [0, 0],
    jumping = 0,
    jumpingFreq = 0,
    jumpingPhase = 0,
    jumpingFreqSmoothed = 0,
    jumpingAmp = 0,
    jumpingAmpSmoothed = 0,
    killSmoothed = 0,
    musicPhase = 0,
    musicTick = 0,
    musicPaused = 0,
    ufoMusicTime = 0,
    excitementSmoothed = 0,
    neverPlayed = 1,
    neverUFOs = 1,
    combos = 0,
    combosTarget,
    gameOver,
    awaitingContinue = 0, //localStorage.ba_pl && parseInt(localStorage.ba_pl),
    // achievements: [nbAsteroids, nbKills, nbUfos]
    achievements,
    lastScoreIncrement = 0,
    lastJump = 0,
    lastBulletShoot = 0,
    lastExtraLife = 0,
    lastLoseShot = 0,
    // Input state : updated by user events, handled & emptied by the update loop
    keys = {},
    tap,
    // variables related to setup
    gameScale;

  function helpVisible() {
    return neverPlayed && incomingObjects[0] && playingSince > 8000;
  }
  /* global audio */

  var Ashot = audio([
      0,
      0.06,
      0.18,
      ,
      0.33,
      0.5,
      0.23,
      -0.04,
      -0.24,
      ,
      ,
      -0.02,
      ,
      0.37,
      -0.22,
      ,
      ,
      ,
      0.8,
      ,
      ,
      ,
      ,
      0.3,
    ]),
    Amusic1 = audio([
      ,
      ,
      0.12,
      ,
      0.13,
      0.16,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      0.7,
      ,
      ,
      ,
      ,
      0.5,
    ]),
    Amusic2 = audio([
      ,
      ,
      0.12,
      ,
      0.13,
      0.165,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      0.7,
      ,
      ,
      ,
      ,
      0.5,
    ]),
    Aexplosion1 = audio([
      3,
      ,
      0.35,
      0.5369,
      0.5,
      0.15,
      ,
      -0.02,
      ,
      ,
      ,
      -0.7444,
      0.78,
      ,
      ,
      0.7619,
      ,
      ,
      0.1,
      ,
      ,
      ,
      ,
      0.5,
    ]),
    Aexplosion2 = audio([
      3,
      ,
      0.38,
      0.5369,
      0.52,
      0.18,
      ,
      -0.02,
      ,
      ,
      ,
      -0.7444,
      0.78,
      ,
      ,
      0.7619,
      ,
      ,
      0.1,
      ,
      ,
      ,
      ,
      0.5,
    ]),
    Asend = audio([
      2,
      0.07,
      0.04,
      ,
      0.24,
      0.25,
      ,
      0.34,
      -0.1999,
      ,
      ,
      -0.02,
      ,
      0.3187,
      ,
      ,
      -0.14,
      0.04,
      0.85,
      ,
      0.28,
      0.63,
      ,
      0.5,
    ]),
    AsendFail = audio([
      1,
      ,
      0.04,
      ,
      0.45,
      0.14,
      0.06,
      -0.06,
      0.02,
      0.87,
      0.95,
      -0.02,
      ,
      0.319,
      ,
      ,
      -0.14,
      0.04,
      0.5,
      ,
      ,
      ,
      ,
      0.4,
    ]),
    Alost = audio([
      0,
      0.11,
      0.37,
      ,
      0.92,
      0.15,
      ,
      -0.06,
      -0.04,
      0.3,
      0.14,
      0.1,
      ,
      0.5047,
      ,
      ,
      ,
      ,
      0.16,
      -0.02,
      ,
      0.5,
      ,
      1,
    ]),
    Aleave = audio([
      0,
      0.11,
      0.36,
      ,
      0.66,
      0.19,
      ,
      0.06,
      -0.06,
      0.05,
      0.8,
      -0.12,
      0.3,
      0.19,
      -0.06,
      ,
      ,
      -0.02,
      0.23,
      -0.02,
      ,
      0.4,
      ,
      0.4,
    ]),
    Acoin = audio([
      0,
      ,
      0.094,
      0.29,
      0.42,
      0.563,
      ,
      ,
      ,
      ,
      ,
      0.4399,
      0.5658,
      ,
      ,
      ,
      ,
      ,
      1,
      ,
      ,
      ,
      ,
      0.5,
    ]),
    Amsg = audio([
      2,
      0.07,
      0.1,
      ,
      0.2,
      0.75,
      0.35,
      -0.1,
      0.12,
      ,
      ,
      -0.02,
      ,
      ,
      ,
      ,
      -0.06,
      -0.0377,
      0.26,
      ,
      ,
      0.8,
      ,
      0.7,
    ]),
    Aufo = audio([
      2,
      0.05,
      0.74,
      ,
      0.33,
      0.5,
      ,
      ,
      ,
      0.46,
      0.29,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      1,
      ,
      ,
      ,
      ,
      0.3,
    ]),
    Alife = audio([
      0,
      0.12,
      0.8,
      0.48,
      0.77,
      0.92,
      ,
      -0.12,
      -0.0999,
      ,
      ,
      -0.4,
      0.2,
      0.34,
      ,
      0.65,
      ,
      ,
      0.93,
      -0.02,
      ,
      ,
      ,
      0.38,
    ]),
    Ajump = audio([
      3,
      ,
      0.12,
      0.56,
      0.27,
      0.07,
      ,
      -0.12,
      0.02,
      ,
      ,
      -0.02,
      0.68,
      ,
      ,
      ,
      -0.04,
      -0.022,
      0.06,
      ,
      ,
      0.06,
      ,
      0.5,
    ]);
  /* global
keys
tap:true
MOBILE
c
d
gameOver
W
gameScale
achievements:true
player:true
playingSince:true
awaitingContinue:true
*/

  /*
for (var i=0; i<99; ++i) keys[i] = 0;

var fullScreenRequested = 0;
function onTap (e) {
  if (MOBILE && !fullScreenRequested && d.webkitRequestFullScreen){
    d.webkitRequestFullScreen();
    fullScreenRequested = 1;
  }

  var r = c.getBoundingClientRect(),
    x = (e.clientX - r.left) / gameScale,
    y = (e.clientY - r.top) / gameScale;
  if (gameOver) {
    if(280 < y && y < 400) {
      if (W/2 - 180 < x && x < W/2 - 20) {
        open("https://twitter.com/intent/tweet?via=greweb&url="+
        encodeURIComponent(location.href)+
        "&text="+
        encodeURIComponent(
          "Reached Level "+player+
          " ("+(player*25)+"¢) with "+
          achievements[0]+"⬠ "+
          achievements[1]+"ᐃ "+
          achievements[2]+"🝞"
        ));
      }
      else if (W/2 + 20 < x && x < W/2 + 180) {
        location.reload();
      }
    }
  }
  else if (awaitingContinue) {
    if (playingSince>0 && 170<y && y<310) {
      // continue game action
      if (x<W/2) { // YES
        player = awaitingContinue-1;
        playingSince = awaitingContinue = 0;
        achievements = localStorage.ba_ach.split(",").map(function (v) {
          return parseInt(v, 10);
        });
      }
      else { // NO
        playingSince = awaitingContinue = 0;
      }
    }
  }
  else {
    tap = [x, y];
  }
}

if (MOBILE) {
  addEventListener("touchstart", function (e) {
    e.preventDefault();
    onTap(e.changedTouches[0]);
  });
}
else {
  addEventListener("click", function (e) {
    e.preventDefault();
    onTap(e);
  });
  addEventListener("keydown", function (e) {
    keys[e.which] = 1;
  });
  addEventListener("keyup", function (e) {
    keys[e.which] = 0;
  });
}
*/
  /* global dt W H */

  function euclidPhysics(obj) {
    obj[0] += obj[2] * dt;
    obj[1] += obj[3] * dt;
  }

  function polarPhysics(obj) {
    var x = Math.cos(obj[2]);
    var y = Math.sin(obj[2]);
    var s = dt * obj[3];
    obj[0] += s * x;
    obj[1] += s * y;
  }

  function destroyOutOfBox(obj, i, arr) {
    if (
      obj[0] < -100 ||
      obj[1] < -100 ||
      obj[0] > W + 100 ||
      obj[1] > H + 100
    ) {
      arr.splice(i, 1);
    }
  }

  function applyLife(obj, i, arr) {
    if ((obj[4] -= dt) < 0) {
      arr.splice(i, 1);
    }
  }

  function loopOutOfBox(obj) {
    if (obj[0] < 0) {
      obj[0] += W;
    } else if (obj[0] > W) {
      obj[0] -= W;
    }
    if (obj[1] < 0) {
      obj[1] += H;
    } else if (obj[1] > H) {
      obj[1] -= H;
    }
  }
  /* global
DEBUG
AIrotate: true
AIboost: true
AIshoot: true
AIexcitement: true
spaceship
t dt
asteroids
bullets
W H
dist normAngle
ufos
playingSince
ctx
*/

  /*
if (DEBUG) {
  /* eslint-disable no-inner-declarations
  var AIdebug = [], AIdebugCircle = [];
  function drawAIDebug () {
    AIdebug.forEach(function (debug, i) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.fillStyle = ctx.strokeStyle = "hsl("+Math.floor(360*i/AIdebug.length)+",80%,50%)";
      ctx.beginPath();
      ctx.moveTo(debug[0], debug[1]);
      ctx.lineTo(debug[2], debug[3]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(debug[0], debug[1], 2, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
    });
    AIdebugCircle.forEach(function (debug, i) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.fillStyle = ctx.strokeStyle = "hsl("+Math.floor(360*i/AIdebugCircle.length)+",80%,50%)";
      ctx.beginPath();
      ctx.arc(debug[0], debug[1], Math.max(0, debug[2] * debug[3]), 0, 2*Math.PI);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(debug[0], debug[1], debug[3], 0, 2*Math.PI);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(debug[2].toFixed(2), debug[0], debug[1]-debug[3]-2);
      ctx.restore();
    });
  }
  function clearDebug () {
    AIdebug = [];
    AIdebugCircle = [];
  }
  function addDebugCircle (p, value, radius) {
    AIdebugCircle.push([ p[0], p[1], value, radius ]);
  }
  function addDebug (p, v) {
    var d = 200;
    AIdebug.push([ p[0], p[1], p[0]+(v?d*v[0]:0), p[1]+(v?d*v[1]:0) ]);
  }
  function addPolarDebug (p, ang, vel) {
    var v = [
      vel * Math.cos(ang),
      vel * Math.sin(ang)
    ];
    addDebug(p, v);
  }
  /* eslint-enable
}
*/

  var closestAsteroidMemory,
    targetShootMemory,
    closestAsteroidMemoryT,
    targetShootMemoryT;

  // AI states
  function aiLogic(smart) {
    // set the 3 AI inputs (rotate, shoot, boost)
    var i;

    // DEBUG && clearDebug();

    // first part is data extraction / analysis

    //var ax = Math.cos(spaceship[4]);
    //var ay = Math.sin(spaceship[4]);
    var vel = Math.sqrt(
      spaceship[2] * spaceship[2] + spaceship[3] * spaceship[3]
    );
    var velAng = Math.atan2(spaceship[3], spaceship[2]);

    //var spaceshipVel = [ ax * vel, ay * vel ];

    // utilities

    function orient(ang) {
      var stableAng = normAngle(ang - spaceship[4]);
      AIrotate = stableAng < 0 ? -1 : 1;
      return stableAng;
    }

    function move(ang, vel) {
      var stableAng = normAngle(ang - spaceship[4]);
      var abs = Math.abs(stableAng);
      if (abs > Math.PI / 2) {
        if (vel) AIboost = abs > Math.PI / 2 - 0.4 ? (vel > 0 ? -1 : 1) : 0;
        AIrotate = stableAng > 0 ? -1 : 1;
      } else {
        if (vel) AIboost = abs < 0.4 ? (vel < 0 ? -1 : 1) : 0;
        AIrotate = stableAng < 0 ? -1 : 1;
      }
    }

    // take actions to move and stabilize to a point
    function moveToPoint(p, minDist) {
      var dx = p[0] - spaceship[0];
      var dy = p[1] - spaceship[1];
      if (dx * dx + dy * dy < minDist * minDist) return;
      var tx = dx / 800;
      var ty = dy / 800;
      var x = tx - spaceship[2];
      var y = ty - spaceship[3];
      var ang = Math.atan2(y, x);
      var dist = length([x, y]);
      move(ang, dist);
    }

    function dot(a, b) {
      // dot product
      return a[0] * b[0] + a[1] * b[1];
    }

    // a line defined by AB, point is P
    function projectPointToLine(p, a, ab) {
      var ap = [p[0] - a[0], p[1] - a[1]];
      var k = dot(ap, ab) / dot(ab, ab);
      return [a[0] + k * ab[0], a[1] + k * ab[1]];
    }

    function moveAwayFromPoint(p, v) {
      var spaceshipToP = [p[0] - spaceship[0], p[1] - spaceship[1]];
      var ang = Math.atan2(spaceshipToP[1], spaceshipToP[0]);
      var dist = length(spaceshipToP);
      // DEBUG && addPolarDebug(p, ang, 0.5);

      if (
        v &&
        vel > 0.003 * dist &&
        Math.abs(normAngle(ang - velAng)) < Math.PI / 3
      ) {
        // if there is some velocity, it is still good to "traverse" the point and not brake
        // but we need to target a bit more far from the obj vel
        var l = length(v);
        spaceshipToP[0] += (100 * v[0]) / l;
        spaceshipToP[1] += (100 * v[1]) / l;
        ang = Math.atan2(spaceshipToP[1], spaceshipToP[0]);
        move(ang, 1);
      } else {
        move(ang, -1);
      }
    }

    // danger have [ x, y, rot, vel ]
    function moveAwayFromAsteroid(ast) {
      var v = [
        ast[3] * Math.cos(ast[2]), // - spaceshipVel[0],
        ast[3] * Math.sin(ast[2]), // - spaceshipVel[1]
      ];
      var p = projectPointToLine(spaceship, ast, v);
      var acceptDist = 30 + 10 * ast[5];
      var d = dist(p, spaceship);
      if (d > acceptDist) return;
      //DEBUG && addDebug(p, v);
      moveAwayFromPoint(p, v);
    }

    function predictShootIntersection(bulletVel, pos, target, targetVel) {
      // http://gamedev.stackexchange.com/a/25292
      var totarget = [target[0] - pos[0], target[1] - pos[1]];
      var a = dot(targetVel, targetVel) - bulletVel * bulletVel;
      var b = 2 * dot(targetVel, totarget);
      var c = dot(totarget, totarget);
      var p = -b / (2 * a);
      var q = Math.sqrt(b * b - 4 * a * c) / (2 * a);
      var t1 = p - q;
      var t2 = p + q;
      var t = t1 > t2 && t2 > 0 ? t2 : t1;

      return [t, [target[0] + targetVel[0] * t, target[1] + targetVel[1] * t]];
    }

    var middle = [W / 2, H / 2];

    var closestAsteroid,
      targetShoot,
      danger = 0;
    var closestAsteroidScore = 0.3,
      targetShootScore = 0.1;
    var incomingBullet,
      incomingBulletScore = 0;

    for (i = 0; i < asteroids.length; ++i) {
      var ast = asteroids[i];
      // FIXME: take velocity of spaceship into account?
      var v = [ast[3] * Math.cos(ast[2]), ast[3] * Math.sin(ast[2])];
      var timeBeforeImpact =
        dot([spaceship[0] - ast[0], spaceship[1] - ast[1]], v) / dot(v, v);
      var impact = [
        ast[0] + timeBeforeImpact * v[0],
        ast[1] + timeBeforeImpact * v[1],
      ];
      var distToImpact = dist(spaceship, impact);
      var distWithSize = distToImpact - 10 - 10 * ast[5];

      var score =
        Math.exp(-distWithSize / 40) +
          Math.exp(-distWithSize / 120) +
          timeBeforeImpact >
        0
          ? Math.exp(-timeBeforeImpact / 1000)
          : 0;

      if (score > closestAsteroidScore) {
        closestAsteroidScore = score;
        closestAsteroid = ast;
        danger++;
      }

      score = Math.exp(-(ast[5] - 1)) * Math.exp(-distWithSize / 200);

      if (score > targetShootScore) {
        var res = predictShootIntersection(0.3, spaceship, ast, v);
        var t = res[0];
        var p = res[1];
        if (0 < p[0] && p[0] < W && 0 < p[1] && p[1] < H && t < 800) {
          targetShoot = p;
          targetShootScore = score;
          //DEBUG && addDebugCircle(p, score, 20);
        }
      }
    }

    for (i = 0; i < bullets.length; ++i) {
      var b = bullets[i];
      v = b.slice(2);
      timeBeforeImpact =
        dot([spaceship[0] - b[0], spaceship[1] - b[1]], v) / dot(v, v);
      impact = [b[0] + timeBeforeImpact * v[0], b[1] + timeBeforeImpact * v[1]];
      distToImpact = dist(spaceship, impact);
      score =
        Math.exp(-timeBeforeImpact / 1000) + 2 * Math.exp(-distToImpact / 50);
      if (
        100 < timeBeforeImpact &&
        timeBeforeImpact < 1000 &&
        distToImpact < 40 &&
        score > incomingBulletScore
      ) {
        incomingBulletScore = score;
        incomingBullet = impact;
      }
    }

    for (i = 0; i < ufos.length; ++i) {
      var u = ufos[i];
      res = predictShootIntersection(0.3, spaceship, u, u.slice(2));
      t = res[0];
      p = res[1];
      targetShoot = p;
    }

    AIexcitement =
      1 -
      Math.exp(-asteroids.length / 10) + // total asteroids
      (1 - Math.exp(-danger / 3)); // danger

    // Now we implement the spaceship reaction
    // From the least to the most important reactions

    // Dump random changes

    AIshoot = playingSince > 3000 && Math.random() < 0.001 * dt * (1 - smart);

    AIrotate =
      playingSince > 1000 && Math.random() < 0.002 * dt
        ? Math.random() < 0.6
          ? 0
          : Math.random() < 0.5
          ? -1
          : 1
        : AIrotate;

    AIboost =
      playingSince > 2000 && Math.random() < 0.004 * dt
        ? Math.random() < 0.7
          ? 0
          : Math.random() < 0.5
          ? -1
          : 1
        : AIboost;

    // Stay in center area

    if (0.1 + smart > Math.random()) moveToPoint(middle, 30);

    // Shot the target

    if (smart > Math.random()) {
      if (targetShoot) {
        AIshoot =
          Math.abs(
            orient(
              Math.atan2(
                targetShoot[1] - spaceship[1],
                targetShoot[0] - spaceship[0]
              )
            )
          ) < 0.1 && Math.random() < 0.04 * dt;
        targetShootMemory = targetShoot;
        targetShootMemoryT = t;
      } else {
        AIshoot = 0;
      }
    }

    // Avoid dangers
    if (smart > Math.random()) {
      if (closestAsteroid) {
        moveAwayFromAsteroid(closestAsteroid);
        closestAsteroidMemory = closestAsteroid;
        closestAsteroidMemoryT = closestAsteroid;
      }

      if (incomingBullet) moveAwayFromPoint(incomingBullet);
    }

    //DEBUG && targetShoot && addPolarDebug(targetShoot, 0, 0);
    //DEBUG && closestAsteroid && addPolarDebug(closestAsteroid, closestAsteroid[2], closestAsteroid[3]);
  }
  /* global
ctx path W H asteroids:true rotatingLetters incPosition incRotation MOBILE play
Asend AsendFail
*/

  // Logic

  function randomAsteroidShape(lvl) {
    var n = 4 + lvl * 2;
    var size = lvl * 10;
    var pts = [];
    for (var i = 0; i < n; ++i) {
      var l = size * (0.4 + 0.6 * Math.random());
      var a = (2 * Math.PI * i) / n;
      pts.push([l * Math.cos(a), l * Math.sin(a)]);
    }
    return pts;
  }

  function randomAsteroids() {
    asteroids = [];
    for (var i = 0; i < 8; ++i) {
      var lvl = Math.floor(1.5 + 3 * Math.random());
      asteroids[i] = [
        W * Math.random(),
        H * Math.random(),
        2 * Math.PI * Math.random(),
        0.02 + 0.02 * Math.random(),
        randomAsteroidShape(lvl),
        lvl,
      ];
    }
  }

  function explodeAsteroid(j) {
    var aster = asteroids[j];
    asteroids.splice(j, 1);
    var lvl = aster[5];
    if (lvl > 1) {
      var nb = Math.round(2 + 1.5 * Math.random());
      for (var k = 0; k < nb; k++) {
        var a = Math.random() + (2 * Math.PI * k) / nb;
        asteroids.push([
          aster[0] + 10 * Math.cos(a),
          aster[1] + 10 * Math.sin(a),
          a,
          0.5 * aster[3],
          randomAsteroidShape(lvl - 1),
          lvl - 1,
        ]);
      }
    }
  }

  function sendAsteroid(o) {
    rotatingLetters.push(o[7]);
    if (Math.abs(Math.cos(o[2])) < o[9]) {
      var p = incPosition(o);
      var rot = incRotation(o);
      var x = Math.max(0, Math.min(p[0], W));
      var y = Math.max(0, Math.min(p[1], H));
      var vel = (MOBILE ? 0.006 : 0.008) * o[3];
      var lvl = o[6];
      var shape = o[5];
      asteroids.push([x, y, rot, vel, shape, lvl]);
      play(Asend);
      return 1;
    } else {
      play(AsendFail);
    }
  }

  /*
function randomInGameAsteroid () {
  var a = Math.random() < 0.5;
  var b = Math.random() < 0.5;
  var lvl = Math.floor(1 + 2 * Math.random() * Math.random());
  asteroids.push([
    a ? (b?-20:W+20) : W * Math.random(),
    !a ? (b?-20:H+20) : H * Math.random(),
    2 * Math.PI * Math.random(),
    0.02 + 0.02 * Math.random(),
    randomAsteroidShape(lvl),
    lvl
  ]);
}
*/

  // RENDERING

  function drawAsteroid(o) {
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#f00";
    path(o[4]);
    ctx.stroke();
  }
  /* global
GAME_INC_PADDING W H t dt borderLength spaceship incomingObjects player
playingSince randomAsteroidShape lifes dying ctx path MOBILE font helpVisible
*/

  function incPosition(o) {
    var i = o[0] % borderLength;
    var x, y;
    var w = W + GAME_INC_PADDING;
    var h = H + GAME_INC_PADDING;
    if (i < w) {
      x = i;
      y = 0;
    } else {
      i -= w;
      if (i < h) {
        x = w;
        y = i;
      } else {
        i -= h;
        if (i < w) {
          x = w - i;
          y = h;
        } else {
          i -= w;
          x = 0;
          y = h - i;
        }
      }
    }
    var p = [-GAME_INC_PADDING / 2 + x, -GAME_INC_PADDING / 2 + y];
    if (o[10]) {
      var dt = t - o[10];
      var a = Math.atan2(spaceship[1] - p[1], spaceship[0] - p[0]);
      var l = dt * 0.3;
      p[0] -= Math.cos(a) * l;
      p[1] -= Math.sin(a) * l;
    }
    return p;
  }

  function incRotationCenter(o) {
    var p = incPosition(o);
    var toCenter = Math.atan2(spaceship[1] - p[1], spaceship[0] - p[0]);
    return toCenter;
  }

  function incRotation(o) {
    return Math.cos(o[2]) * o[8] + incRotationCenter(o);
    //return o[2];
  }

  var nextCreate = 0;
  function maybeCreateInc() {
    var sum = incomingObjects.reduce(function (sum, o) {
      return o[6];
    }, 0);
    // create inc is ruled with probabilities
    if (
      nextCreate < t &&
      Math.random() <
        0.01 *
          dt * // continous time probability
          Math.exp(
            -sum * // more there is object, more it is rare to create new ones
              (1 +
                5 * Math.exp(-(player - 1) / 3) -
                0.2 * Math.exp(-Math.abs(player - 20) / 20)) // first rounds have less items
          ) *
          (1 - Math.exp(-playingSince / 5000))
    ) {
      nextCreate = t + 1000 * (1 + Math.random());
      return createInc();
    }
  }

  var rotatingLetters = [];
  for (var rotatingLettersI = 0; rotatingLettersI < 26; rotatingLettersI++)
    rotatingLetters.push(65 + rotatingLettersI);
  rotatingLetters.sort(function () {
    return Math.random() - 0.5;
  });

  function createInc() {
    if (!rotatingLetters.length) return 0;
    var pos = Math.random() * borderLength;
    var key = rotatingLetters.shift();
    for (var i = 0; i < incomingObjects.length; ++i) {
      var o = incomingObjects[i];
      var p = o[0] % borderLength;
      if (pos - 60 < p && p < pos + 60) return 0;
    }

    /*
  PARAMS to vary with game difficulty
  - higher rotation amplitude
  - lower rotation valid amp ratio
  - higher rotation speed
  */

    var diffMax = 1 - Math.exp(-player / 5);
    var diffMin = 1 - Math.exp((1 - player) / 20);
    if (Math.random() > diffMax) diffMin *= Math.random();

    var pRotAmp = diffMin + Math.random() * (diffMax - diffMin);
    var pRotAmpRatio = diffMin + Math.random() * (diffMax - diffMin);
    var pRotSpeed = diffMin + Math.random() * (diffMax - diffMin);

    var lvl = Math.floor(
      2 +
        3 * Math.random() * Math.random() +
        4 * Math.random() * Math.random() * Math.random()
    );
    var ampRot =
      player < 2 ? 0 : Math.PI * (0.8 * Math.random() + 0.05 * lvl) * pRotAmp;
    if (ampRot < 0.2) ampRot = 0;
    var ampRotRatio =
      player > 2 &&
      ampRot > Math.exp(-player / 4) &&
      Math.random() >
        0.5 +
          (0.4 * ((player - 3) % 8)) / 8 -
          0.5 * (1 - Math.exp(-player / 10))
        ? 0.9 - 0.5 * pRotAmpRatio - 0.2 * pRotAmp
        : 1;

    if (player == 2) {
      ampRot = 0.2 + Math.random();
    }

    if (player == 3) {
      ampRot = 0.2 + Math.random();
      ampRotRatio = 0.5 + 0.4 * Math.random();
    }

    incomingObjects.push([
      pos,
      // velocity
      0.1 + 0.002 * player,
      // initial angle
      2 * Math.PI * Math.random(),
      // initial force
      10 + 40 * Math.random(),
      // rot velocity
      0.002 +
        0.001 *
          (Math.random() +
            0.5 * lvl * Math.random() +
            (Math.random() * player) / 30) *
          pRotSpeed -
        0.001 * pRotAmp,
      // shape
      randomAsteroidShape(lvl),
      // level
      lvl,
      // key
      key,
      // amplitude rotation
      ampRot,
      // amplitude rotation valid ratio
      ampRotRatio,
      // explode time
      0,
    ]);
    return 1;
  }

  function applyIncLogic(o) {
    if (!o[10]) {
      o[0] += o[1] * dt;
      o[2] += o[4] * dt;
      o[3] = o[3] < 10 ? 60 : o[3] - 0.02 * dt;
    }
  }

  // RENDERING

  function drawInc(o) {
    var rotC = incRotationCenter(o);
    var phase = Math.cos(o[2]);
    var rot = phase * o[8] + rotC;
    var w = 10 * o[6];
    var valid = Math.abs(phase) < o[9];

    if (playingSince > 0 && lifes && !dying && !o[10]) {
      ctx.lineWidth = 1 + o[3] / 60;
      ctx.strokeStyle = valid ? "#7cf" : "#f66";

      if (o[8] > 0.1) {
        ctx.save();
        ctx.rotate(rotC);
        ctx.strokeStyle = "#f66";
        ctx.beginPath();
        ctx.arc(0, 0, w + 10, -o[8], -o[8] * o[9]);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, w + 10, o[8] * o[9], o[8]);
        ctx.stroke();
        ctx.strokeStyle = "#7cf";
        ctx.beginPath();
        ctx.arc(0, 0, w + 10, -o[8] * o[9], o[8] * o[9]);
        ctx.stroke();
        path([
          [w + 8, 0],
          [w + 12, 0],
        ]);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.rotate(rot);
      ctx.save();
      var mx = 60 + w;
      var x = o[3] + w;
      ctx.globalAlpha = 0.2;
      path([
        [0, 0],
        [mx, 0],
      ]);
      ctx.stroke();
      ctx.restore();
      path([
        [0, 0],
        [x, 0],
      ]);
      ctx.stroke();
      var r = 6;
      path(
        [
          [mx - r, r],
          [mx, 0],
          [mx - r, -r],
        ],
        1
      );
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = o[10] ? "#f66" : "#999";
    }

    ctx.save();
    path(o[5]);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    var sum = [0, 0];
    o[5].forEach(function (p) {
      sum[0] += p[0];
      sum[1] += p[1];
    });

    if (!MOBILE && playingSince > 0) {
      if (helpVisible()) {
        ctx.strokeStyle = "#f7c";
      }
      ctx.translate(sum[0] / o[5].length + 1, sum[1] / o[5].length - 5);
      font(String.fromCharCode(o[7]), 1);
    }
  }

  function drawIncHelp() {
    if (!helpVisible()) return;
    ctx.strokeStyle = "#f7c";
    ctx.lineWidth = 4;
    incomingObjects.forEach(function (o) {
      var p = incPosition(o);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 80 + 40 * Math.cos(0.005 * t), 0, 2 * Math.PI);
      ctx.stroke();
    });
  }
  /* global
ctx bullets
*/

  function shoot(obj, vel, ang) {
    var ax = Math.cos(ang);
    var ay = Math.sin(ang);
    bullets.push([
      obj[0] + 14 * ax,
      obj[1] + 14 * ay,
      obj[2] + vel * ax,
      obj[3] + vel * ay,
      1000,
      0,
    ]);
  }

  // RENDERING

  function drawBullet() {
    ctx.globalAlpha = 1 - Math.random() * Math.random();
    ctx.fillStyle = "#00f";
    ctx.beginPath();
    ctx.arc(0, 0, 2 + 2.5 * Math.random(), 0, 2 * Math.PI);
    ctx.fill();
  }
  /* global
particles play Aexplosion1 Aexplosion2 ctx
*/
  function explose(o) {
    play(Math.random() < 0.5 ? Aexplosion1 : Aexplosion2);
    var n = Math.floor(19 + 9 * Math.random());
    for (var i = 0; i < n; ++i) {
      var l = 30 * Math.random() - 10;
      var a = (Math.random() + 2 * Math.PI * i) / n;
      particles.push([
        o[0] + l * Math.cos(a),
        o[1] + l * Math.sin(a),
        a,
        0.06,
        Math.random() < 0.3 ? 0 : 1000,
      ]);
    }
  }

  // RENDERING

  function drawParticle() {
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    ctx.fill();
  }
  /* global
ctx t path lifes play Alost AIboostSmoothed dying:true deads:true achievements killSmoothed:true
*/

  function spaceshipDie() {
    if (dying) return;
    dying = t;
    if (lifes == 1) {
      play(Alost);
    }
    deads++;
    achievements[1]++;
    killSmoothed++;
  }

  /*
function resetSpaceship () {
  var x = W * (0.25 + 0.5 * Math.random());
  var y = H * (0.25 + 0.5 * Math.random());
  spaceship = [x, y, 0, 0];
}
*/

  // RENDERING

  function drawSpaceship(o) {
    ctx.strokeStyle = "#f00";
    ctx.globalAlpha = 0.4;
    ctx.rotate(o[4]);
    if (dying) {
      ctx.lineWidth = 2;
      var delta = (t - dying) / 200;

      path([
        [-6, -6 - 0.5 * delta],
        [3, -3 - 0.9 * delta],
      ]);
      ctx.stroke();

      if (delta < 8) {
        path([
          [3 + 0.4 * delta, -3 - 0.8 * delta],
          [12 + 0.4 * delta, 0 - 0.5 * delta],
        ]);
        ctx.stroke();
      }

      path([
        [12, 0 + 0.4 * delta],
        [3, 3 + delta],
      ]);
      ctx.stroke();

      if (delta < 9) {
        path([
          [1, 5 + delta],
          [-6, 6 + delta],
        ]);
        ctx.stroke();
      }

      if (delta < 7) {
        path([
          [-6 - delta, -6],
          [-6 - delta, 6],
        ]);
        ctx.stroke();
      }
    } else {
      path([
        [-6, -6],
        [12, 0],
        [-6, 6],
        [-5, 0],
      ]);
      ctx.stroke();
      if (AIboostSmoothed > 0.2) {
        path([
          [-7, 2 * Math.random() - 1],
          [-7 - 5 * AIboostSmoothed, 4 * Math.random() - 2],
        ]);
        ctx.stroke();
      }
      if (AIboostSmoothed < -0.2) {
        path([
          [2, -5],
          [2 - 5 * AIboostSmoothed, -7],
          ,
          [2, 5],
          [2 - 5 * AIboostSmoothed, 7],
        ]);
        ctx.stroke();
      }
    }
  }
  /* global
dt dying spaceship shoot ctx path
*/

  function applyUFOlogic(o) {
    o[4] -= dt;
    if (o[4] < 0) {
      o[4] = 500 + 300 * Math.random();
      if (!dying) {
        var target = Math.atan2(spaceship[1] - o[1], spaceship[0] - o[0]);
        if (!o[2] || Math.random() < 0.2) {
          var randomAngle = 2 * Math.PI * Math.random();
          o[2] = 0.08 * Math.cos(randomAngle);
          o[3] = 0.08 * Math.sin(randomAngle);
        }
        shoot(o, 0.3 + 0.1 * Math.random(), target + 0.6 * Math.random() - 0.3);
      }
    }
  }

  // RENDERING

  var UFOa = [
    [8, 0],
    [7, 5],
    [0, 9],
    [7, 14],
  ];
  var UFOb = [
    [15, 14],
    [22, 9],
    [15, 5],
    [14, 0],
  ];

  var UFO = UFOa.concat(UFOb)
    .concat(UFOa)
    .concat([,])
    .concat(UFOb)
    .concat([, [7, 5], [15, 5], , [0, 9], [22, 9]]);

  function drawUFO() {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = "#f00";
    path(UFO);
    ctx.stroke();
  }
  /* global
ctx path font gameOver W H player playingSince:true awaitingContinue scoreTxt
lifes dying MOBILE best score t UFO neverPlayed lastExtraLife neverUFOs dt play
Amsg GAME_MARGIN FW FH combos achievements musicTick helpVisible */

  // IN GAME UI

  function button(t1, t2) {
    ctx.globalAlpha = 1;
    path([
      [0, 0],
      [160, 0],
      [160, 120],
      [0, 120],
    ]);
    ctx.translate(80, 30);
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.save();
    font(t1, 2);
    ctx.restore();
    ctx.save();
    ctx.translate(0, 40);
    font(t2, 2);
    ctx.restore();
  }

  function drawGameUI() {
    ctx.save();
    ctx.fillStyle = ctx.strokeStyle = "#0f0";
    ctx.globalAlpha = 0.3;

    if (gameOver) {
      ctx.save();
      ctx.strokeStyle = "#0f0";
      ctx.globalAlpha = 0.3;
      ctx.save();
      ctx.translate((W - 340) / 2, H / 8);
      font("YOU EARNED ", 2, 1);
      ctx.globalAlpha = 0.5;
      font(player * 25 + "¢", 2, 1);
      ctx.restore();
      ctx.save();
      ctx.translate(W / 2, H / 4);
      font("FROM " + player + " PLAYERS", 2);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.translate((W - 200) / 2, H / 2);
      drawAchievements(2);
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 - 180, H - 160);
      button("TWEET", "SCORE");
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 + 20, H - 160);
      button("PLAY", "AGAIN");
      ctx.restore();

      ctx.restore();
    } else if (playingSince < 0 || awaitingContinue) {
      ctx.save();
      ctx.translate(W - 50, 20);
      font(scoreTxt(0), 1.5, -1);
      ctx.restore();

      ctx.save();
      ctx.translate(50, 70);
      if ((!awaitingContinue || playingSince > 0) && t % 1000 < 500)
        font("PLAYER " + (awaitingContinue || player + 1), 2, 1);
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 - 160, 0.7 * H);
      path([
        [0, 2],
        [0, 18],
      ]);
      ctx.stroke();
      ctx.translate(40, 0);
      font("COIN", 2, 1);
      ctx.translate(40, 0);
      path([
        [0, 2],
        [0, 18],
      ]);
      ctx.stroke();
      ctx.translate(40, 0);
      font("PLAY", 2, 1);
      ctx.restore();
    } else {
      for (var i = 1; i < lifes; i++) {
        ctx.save();
        ctx.translate(60 + i * 10, 50);
        ctx.rotate(-Math.PI / 2);
        path([
          [-4, -4],
          [10, 0],
          [-4, 4],
          [-3, 0],
        ]);
        ctx.stroke();
        ctx.restore();
      }
    }
    if (!gameOver && dying && lifes == 1) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.translate(W / 2, 140);
      font("GAME OVER", 2);
      ctx.restore();
    }
    if (!gameOver && awaitingContinue && playingSince > 0) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(W / 2, 140);
      font("CONTINUE ?", 3);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(W / 4, 210);
      font("YES", MOBILE ? 4 : 6);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate((3 * W) / 4, 210);
      font("NO", MOBILE ? 4 : 6);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(W / 2, H - 14);
    font("2015 GREWEB INC", 0.6);
    ctx.restore();

    if (!gameOver) {
      ctx.save();
      ctx.translate(W / 2, 20);
      font(scoreTxt(best), 0.6);
      ctx.restore();

      ctx.save();
      ctx.translate(50, 20);
      font(scoreTxt(score), 1.5, 1);
      ctx.restore();
    }

    if (gameOver || (playingSince < 0 && t % 1000 < 800)) {
      ctx.save();
      ctx.translate(W - 20, H - 24);
      font(MOBILE ? "MOBILE" : "DESKTOP", 0.6, -1);
      ctx.restore();
      ctx.save();
      ctx.translate(W - 20, H - 14);
      font("VERSION", 0.6, -1);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawGlitch() {
    ctx.save();
    ctx.fillStyle = ctx.strokeStyle = "#f00";
    ctx.globalAlpha = 0.03;
    ctx.translate(W / 2, H / 2);
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 12, 4, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 12, 1, 2);
    ctx.stroke();
    ctx.restore();
  }

  // EXTERNAL UI

  var badgesIcons = [
    [
      [-11, -11],
      [4, -13],
      [6, -6],
      [14, 0],
      [14, 8],
      [6, 8],
      [-6, 14],
      [-14, 0],
    ],
    [
      [-8, 13],
      [0, -13],
      [8, 13],
      [0, 11],
      [-8, 13],
      ,
      [-10, -2],
      [10, 2],
      ,
      [10, -2],
      [-10, 2],
      ,
    ],
    UFO.map(function (p) {
      return p ? [p[0] - 11, p[1] - 7] : p;
    }),
  ];

  var lastStatement,
    lastStatementTime = 0;

  var lastMessage2;

  function drawUI() {
    var currentMessage = "",
      currentMessage2 = "",
      currentMessageClr = "#f7c",
      currentMessageClr2 = "#7fc";

    function announcePlayer(player) {
      currentMessage = "PLAYER " + player;
      currentMessage2 = [
        "GENIOUS PLAYER!!",
        "EXPERIENCED PLAYER!!",
        "GOOD PLAYER. GET READY",
        "NICE PLAYER.",
        "BEGINNER.",
        "VERY BEGINNER. EASY KILL",
      ][Math.floor(Math.exp(-player / 8) * 6)];
    }

    if (gameOver) {
      currentMessage = "PLAYER MASTERED THE GAME";
      currentMessage2 = "REACHED ᐃᐃᐃᐃᐃ";
    } else if (!player) {
      if (playingSince < -7000) {
        currentMessage = "BEHIND ASTEROIDS";
        currentMessage2 = "THE DARK SIDE";
      } else if (playingSince < -3500) {
        currentMessageClr = currentMessageClr2 = "#7cf";
        currentMessage = "SEND ASTEROIDS TO MAKE";
        currentMessage2 = "PLAYERS WASTE THEIR MONEY";
      } else if (!awaitingContinue) {
        var nb = Math.min(25, Math.floor((playingSince + 3500) / 80));
        for (var i = 0; i < nb; i++) currentMessage += ".";
        if (playingSince > -2000) currentMessage2 = "A NEW PLAYER!";
      } else {
        if (playingSince < 0) playingSince = 0; // jump to skip the "player coming"
        announcePlayer(awaitingContinue);
      }
    } else if (dying) {
      if (lifes == 1) {
        currentMessageClr2 = "#f66";
        currentMessage = "GOOD JOB !!!";
        currentMessage2 = "THE DUDE IS BROKE";
      } else if (lifes == 2) {
        currentMessageClr2 = "#f66";
        currentMessage = "OK...";
        currentMessage2 = "ONE MORE TIME !";
      } else {
        if (lastStatement && t - lastStatementTime > 3000) {
          // lastStatementTime is not used here
          currentMessage = lastStatement;
        } else {
          currentMessage = [
            "!!!",
            "GREAT!",
            "COOL!",
            "OMG!",
            "AHAH!",
            "RUDE!",
            "EPIC!",
            "WICKED!",
            "SHAME!",
            "HEHEHE!",
            "BWAHAHA!",
          ];
          lastStatement = currentMessage =
            currentMessage[Math.floor(Math.random() * currentMessage.length)];
          lastStatementTime = 0;
        }
      }
    } else {
      if (playingSince < 0) {
        currentMessage = "INCOMING NEW PLAYER...";
        currentMessage2 = "25¢ 25¢ 25¢ 25¢ 25¢";
      } else if (playingSince < 6000 && lifes == 4) {
        announcePlayer(player);
      } else {
        currentMessageClr2 = "#f66";
        if (lastStatement && t - lastStatementTime < 3000) {
          currentMessage2 = lastStatement;
        } else {
          if (neverPlayed) {
            if (helpVisible()) {
              currentMessageClr = currentMessageClr2 = "#f7c";
              currentMessage = MOBILE
                ? "TAP ON ASTEROIDS"
                : "PRESS ASTEROIDS LETTER";
              currentMessage2 = "TO SEND THEM TO THE GAME";
            }
          } else if (lifes > 4 && t - lastExtraLife > 5000) {
            currentMessageClr = currentMessageClr2 = "#f66";
            currentMessage = "DON'T LET PLAYER";
            currentMessage2 = "REACH ᐃᐃᐃᐃᐃ !!!";
          } else if (score > 10000 && t - lastExtraLife < 4500) {
            currentMessageClr = currentMessageClr2 = "#f66";
            currentMessage = "OH NO! PLAYER JUST";
            currentMessage2 = "WON AN EXTRA LIFE!";
          } else if (player == 2 && 5000 < playingSince) {
            currentMessageClr2 = currentMessageClr = "#7cf";
            currentMessage = "LETS TRAIN WITH...";
            currentMessage2 = "AIMING";
          } else if (player == 3 && 5000 < playingSince) {
            currentMessageClr = "#7cf";
            currentMessageClr2 = "#f66";
            currentMessage = "CAREFUL ABOUT THE";
            currentMessage2 = "RED AIMING";
          } else if (player == 4 && 5000 < playingSince && neverUFOs) {
            currentMessageClr = currentMessageClr2 = "#f7c";
            currentMessage = "MAKE COMBOS TO SEND";
            currentMessage2 = "AN UFO !!!";
          } else if (player > 5) {
            lastStatement = 0;
            if (Math.random() < 0.0001 * dt && t - lastStatementTime > 8000) {
              currentMessage2 = [
                "COME ON! KILL IT!",
                "JUST DO IT!",
                "I WANT ¢¢¢",
                "GIVE ME SOME ¢¢¢",
                "DO IT!",
                "DESTROY IT!",
              ];
              lastStatement = currentMessage2 =
                currentMessage2[
                  Math.floor(Math.random() * currentMessage2.length)
                ];
              lastStatementTime = t;
            }
          }
        }
      }
    }

    if (
      currentMessage2 &&
      lastMessage2 !== currentMessage2 &&
      (currentMessageClr2 == "#f66" || currentMessageClr2 == "#f7c")
    ) {
      play(Amsg);
    }

    ctx.save();
    ctx.translate(GAME_MARGIN, MOBILE ? 40 : 2);
    ctx.lineWidth = t % 600 > 300 ? 2 : 1;
    ctx.save();
    ctx.strokeStyle = currentMessageClr;
    font(currentMessage, MOBILE ? 1.5 : 2, 1);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = currentMessageClr2;
    ctx.translate(0, MOBILE ? 30 : 40);
    font((lastMessage2 = currentMessage2), MOBILE ? 1.5 : 2, 1);
    ctx.restore();
    ctx.restore();

    if (gameOver) return;

    ctx.save();
    ctx.translate(FW - GAME_MARGIN, 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#7cf";
    font(((playingSince > 0 && awaitingContinue) || player) * 25 + "¢", 2, -1);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = musicTick ? 1 : 0.6;
    ctx.strokeStyle = "#7cf";
    ctx.translate(FW - GAME_MARGIN, FH - 30);
    if (combos) font(combos + "x", 1.5, -1);
    ctx.restore();

    /*
  if (combos && combosTarget-combos < 9) {
    ctx.save();
    ctx.strokeStyle = "#7cf";
    ctx.globalAlpha = musicTick ? 1 : 0.5;
    ctx.translate(FW - GAME_MARGIN, FH - 50);
    font((1+combosTarget-combos)+" ", 1, -1);
    ctx.translate(0, 0);
    path(UFO);
    ctx.stroke();
    ctx.restore();
  }
  */

    if (achievements) {
      ctx.save();
      ctx.translate(GAME_MARGIN + 50, FH - 20);
      ctx.strokeStyle = "#fc7";
      drawAchievements(1);
      ctx.restore();
    }
  }

  function drawAchievements(fontSize) {
    for (var j = 0; j < 3; j++) {
      var badge = achievements[j];
      if (badge) {
        ctx.save();
        ctx.translate(100 * j, 0);
        path(badgesIcons[j]);
        ctx.stroke();
        ctx.translate(0, -20 - 10 * fontSize);
        font("" + badge, fontSize);
        ctx.restore();
      }
    }
  }
  /* global
g
gl
textureGame
smoothstep
glSetTexture
glBindFBO
glGetFBOTexture
glUniformLocation
glBindTexture
laserFbo
playerFbo
glareFbo
fbo1 fbo2
persistenceFbo
copyShader
glBindShader
laserShader
playerShader
blur1dShader
gameShader
glareShader
persistenceShader
t
excitementSmoothed
gameOver
player
playingSince
lifes
lastLoseShot
shaking
jumping
dying
*/

  function drawPostProcessing() {
    glSetTexture(textureGame, g);

    // Laser
    glBindFBO(laserFbo);
    glBindShader(laserShader);
    gl.uniform1i(
      glUniformLocation(laserShader, "t"),
      glBindTexture(textureGame, 0)
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Player / env
    glBindFBO(playerFbo);
    glBindShader(playerShader);
    gl.uniform1f(glUniformLocation(playerShader, "pt"), playingSince / 1000);
    gl.uniform1f(glUniformLocation(playerShader, "pl"), player);
    gl.uniform1f(
      glUniformLocation(playerShader, "ex"),
      gameOver || excitementSmoothed
    );
    gl.uniform1f(glUniformLocation(playerShader, "J"), jumping);
    gl.uniform1f(
      glUniformLocation(playerShader, "P"),
      playingSince < 0 || gameOver || dying ? 0 : 1
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(fbo1);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(playerFbo), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 2, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(fbo2);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(fbo1), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), -2, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(fbo1);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(fbo2), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 6, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(playerFbo);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(fbo1), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 0, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Glare
    glBindFBO(glareFbo);
    glBindShader(glareShader);
    gl.uniform1i(
      glUniformLocation(glareShader, "t"),
      glBindTexture(glGetFBOTexture(laserFbo), 0)
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(fbo1);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(glareFbo), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 2, -4);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(glareFbo);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(fbo1), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 4, -8);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Blur
    glBindFBO(fbo1);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(laserFbo), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 0.5, 0.5);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(fbo2);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(fbo1), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), -0.5, 0.5);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(fbo1);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(fbo2), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 1, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(fbo2);
    glBindShader(blur1dShader);
    gl.uniform1i(
      glUniformLocation(blur1dShader, "t"),
      glBindTexture(glGetFBOTexture(fbo1), 0)
    );
    gl.uniform2f(glUniformLocation(blur1dShader, "dir"), 0, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Persistence
    glBindFBO(fbo1);
    glBindShader(persistenceShader);
    gl.uniform1i(
      glUniformLocation(persistenceShader, "t"),
      glBindTexture(glGetFBOTexture(fbo2), 0)
    );
    gl.uniform1i(
      glUniformLocation(persistenceShader, "r"),
      glBindTexture(glGetFBOTexture(persistenceFbo), 1)
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    glBindFBO(persistenceFbo);
    glBindShader(copyShader);
    gl.uniform1i(
      glUniformLocation(copyShader, "t"),
      glBindTexture(glGetFBOTexture(fbo1), 0)
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Final draw
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    glBindShader(gameShader);
    gl.uniform1i(
      glUniformLocation(gameShader, "G"),
      glBindTexture(glGetFBOTexture(laserFbo), 0)
    );
    gl.uniform1i(
      glUniformLocation(gameShader, "R"),
      glBindTexture(glGetFBOTexture(persistenceFbo), 1)
    );
    gl.uniform1i(
      glUniformLocation(gameShader, "B"),
      glBindTexture(glGetFBOTexture(fbo2), 2)
    );
    gl.uniform1i(
      glUniformLocation(gameShader, "L"),
      glBindTexture(glGetFBOTexture(glareFbo), 3)
    );
    gl.uniform1i(
      glUniformLocation(gameShader, "E"),
      glBindTexture(glGetFBOTexture(playerFbo), 4)
    );
    gl.uniform1f(
      glUniformLocation(gameShader, "s"),
      !player ? smoothstep(-4000, -3000, playingSince) : 1
    );
    gl.uniform1f(
      glUniformLocation(gameShader, "F"),
      smoothstep(300, 0, t - lastLoseShot) + !gameOver && lifes > 4
        ? 0.5 * smoothstep(-1, 1, Math.cos(0.01 * t))
        : 0
    );
    gl.uniform2f(glUniformLocation(gameShader, "k"), shaking[0], shaking[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  /* eslint-disable no-undef */
  /* eslint-enable no-unused-vars */

  randomAsteroids();
  raf = requestAnimationFrame(render);

  if (DEBUG) {
    /* eslint-disable */
    /*
  // DEBUG the game over screen
  setTimeout(function () {
    playingSince = -1;
    awaitingContinue = 0;
    player = 42;
    achievements = [123, 45, 6];
    gameOver = 1;
  }, 1000);
*/
    // Debug the levels
    addEventListener("resize", function () {
      playingSince = -1;
      awaitingContinue = 0;
      player++;
      incomingObjects = [];
      console.log("player=", player);
      /*
    ufos.push([
      0, 0, 0, 0, 0
    ]);
    */
    });

    /*
  setTimeout(function () {
    killSmoothed ++;
  }, 100);
  setTimeout(function () {
    killSmoothed ++;
  }, 2000);
  */

    // Debug the incomingObjects

    /*
  setInterval(function () {
    createInc();
    if (incomingObjects[0]) sendAsteroid(incomingObjects[0]);
    incomingObjects.splice(0, 1);
  }, 800);
*/

    /* eslint-enable */
  }

  window._behindAsteroids_send = function () {
    createInc();
    if (incomingObjects[0]) sendAsteroid(incomingObjects[0]);
    incomingObjects.splice(0, 1);
  };

  // Game Render Loop

  var _lastT,
    _lastCheckSize = -9999;
  function render(_t) {
    raf = requestAnimationFrame(render);
    if (!_lastT) _lastT = _t;
    dt = Math.min(100, _t - _lastT);
    _lastT = _t;

    if (t - _lastCheckSize > 200) checkSize();

    t += dt; // accumulate the game time (that is not the same as _t)

    // UPDATE game
    update();

    // RENDER game

    // Game rendering

    ctx = gameCtx;

    ctx.save();

    drawGame();

    ctx.restore();

    RENDER_CB();
  }

  // Game Update Loop

  function update() {
    playingSince += dt;

    if (t - ufoMusicTime > 1200) {
      ufoMusicTime = t;
      if (ufos[0]) play(Aufo);
    }

    if (!gameOver && !awaitingContinue) {
      if (playingSince > 0 && !achievements) {
        achievements = [0, 0, 0];
      }

      var i;
      var nbSpaceshipBullets = 0;

      if (
        !dying &&
        playingSince > 0 &&
        t - musicPaused > 5000 &&
        player > 2 &&
        !ufos.length
      ) {
        combosTarget = Math.floor(30 - 25 * Math.exp(-(player - 3) / 15));
        var musicFreq = (3 * combos) / combosTarget;
        if (combos > combosTarget) {
          musicPaused = t;
          neverUFOs = combos = 0;
          ufos.push([W * Math.random(), H * Math.random(), 0, 0, 0]);
          achievements[2]++;
        }

        musicPhase += (musicFreq * 2 * Math.PI * dt) / 1000;
        if (Math.sin(musicPhase) > 0 !== musicTick) {
          musicTick = !musicTick;
          play(musicTick ? Amusic1 : Amusic2);
        }
      }

      // randomly send some asteroids
      /*
    if (Math.random() < 0.001 * dt)
      randomInGameAsteroid();
    */

      // player lifecycle

      if (lifes === 0 && playingSince > 0) {
        // player enter
        resurrectionTime = t;
        lifes = 4;
        player++;
        score = 0;
        scoreForLife = 10000;
        jumpingAmp = 0;
        jumpingFreq = 0;
        asteroids = [];
        ufos = [];
        play(Acoin);
        if (player > 1) {
          //localStorage.ba_pl = player;
          //localStorage.ba_ach = achievements;
        }
      }

      // inc lifecycle

      if (playingSince > 1000 && !dying) {
        for (i = 0; i < incomingObjects.length; i++) {
          var o = incomingObjects[i];
          if (!o[10]) {
            var p = incPosition(o);
            var matchingTap =
              tap && circleCollides(tap, p, (MOBILE ? 60 : 20) + 10 * o[6]);
            if (keys[o[7]] || matchingTap) {
              // send an asteroid
              neverPlayed = tap = keys[o[7]] = 0;
              if (sendAsteroid(o)) {
                achievements[0]++;
                if (player > 3) combos++;
                incomingObjects.splice(i--, 1);
              } else {
                // failed to aim (red aiming)
                score += 5000;
                combos = 0;
                lastLoseShot = o[10] = t;
              }
            }
          } else {
            if (t - o[10] > 1000) incomingObjects.splice(i--, 1);
          }
        }
        tap = 0;

        while (maybeCreateInc());
      }

      // spaceship lifecycle

      if (dying && t - dying > 2000 + (lifes > 1 ? 0 : 2000)) {
        dying = 0;
        spaceship = [W / 2, H / 2, 0, 0, 0];
        if (--lifes) {
          resurrectionTime = t;
        } else {
          // Player lost. game over
          playingSince = -5000;
          randomAsteroids();
          ufos = [];
          setTimeout(function () {
            play(Aleave);
          }, 1000);
        }
      }

      // score lifecycle

      if (score >= scoreForLife) {
        lastExtraLife = t;
        lifes++;
        scoreForLife += 10000;
        play(Alife);
        if (lifes > 5) {
          gameOver = 1;
          incomingObjects = [];
          ufos = [];
          randomAsteroids();
          //localStorage.ba_pl=0;
        }
      }

      if (!dying && playingSince > 0 && t - lastScoreIncrement > 100) {
        score += 10;
        lastScoreIncrement = t;
      }
      best = Math.max(best, score);

      // collision

      bullets.forEach(function (bull, i) {
        if (!bull[5]) nbSpaceshipBullets++;
        var j;

        if (bull[4] < 900) {
          // bullet-spaceship collision
          if (!dying && circleCollides(bull, spaceship, 20)) {
            explose(bull);
            bullets.splice(i, 1);
            spaceshipDie();
            return;
          }

          // bullet-ufo collision
          for (j = 0; j < ufos.length; ++j) {
            var ufo = ufos[j];
            if (circleCollides(bull, ufo, 20)) {
              explose(bull);
              bullets.splice(i, 1);
              ufos.splice(j, 1);
              return;
            }
          }
        }

        for (j = 0; j < asteroids.length; ++j) {
          var aster = asteroids[j];
          var lvl = aster[5];
          // bullet-asteroid collision
          if (circleCollides(bull, aster, 10 * lvl)) {
            explose(bull);
            bullets.splice(i, 1);
            explodeAsteroid(j);
            score += 50 * Math.floor(0.4 * (6 - lvl) * (6 - lvl));
            return;
          }
        }
      });

      if (!dying && playingSince > 0)
        asteroids.forEach(function (aster, j) {
          // asteroid-spaceship collision
          if (circleCollides(aster, spaceship, 10 + 10 * aster[5])) {
            if (t - resurrectionTime < 200) {
              // if spaceship just resurect, will explode the asteroid
              explodeAsteroid(j);
            } else {
              // otherwise, player die
              explose(spaceship);
              spaceshipDie();
            }
          }
        });

      // run spaceship AI
      AIexcitement = 0;
      if (!dying && playingSince > 0) {
        var ax = Math.cos(spaceship[4]);
        var ay = Math.sin(spaceship[4]);

        // ai logic (determine the 3 inputs)
        aiLogic(1 - Math.exp(-(player - 0.8) / 14));

        // apply ai inputs with game logic

        var rotSpeed = 0.004 + 0.003 * (1 - Math.exp(-player / 40));
        var accSpeed =
          0.0003 - 0.0002 * Math.exp(-(player - 1) / 5) + 0.00001 * player;
        var shotRate =
          100 +
          1000 * Math.exp(-(player - 1) / 8) +
          300 * Math.exp(-player / 20);

        spaceship[2] += AIboost * dt * accSpeed * ax;
        spaceship[3] += AIboost * dt * accSpeed * ay;
        spaceship[4] = normAngle(spaceship[4] + AIrotate * dt * rotSpeed);
        if (nbSpaceshipBullets < 3) {
          if (AIshoot && t - lastBulletShoot > shotRate) {
            lastBulletShoot = t;
            play(Ashot);
            shoot(spaceship, 0.3, spaceship[4]);
          }
        }
      }
    }

    euclidPhysics(spaceship);
    asteroids.forEach(polarPhysics);
    ufos.forEach(euclidPhysics);
    bullets.forEach(euclidPhysics);
    particles.forEach(polarPhysics);

    ufos.forEach(applyUFOlogic);
    incomingObjects.forEach(applyIncLogic);

    particles.forEach(applyLife);
    loopOutOfBox(spaceship);
    asteroids.forEach(
      playingSince > 0 && !awaitingContinue && !gameOver
        ? destroyOutOfBox
        : loopOutOfBox
    );
    ufos.forEach(loopOutOfBox);
    bullets.forEach(applyLife);
    bullets.forEach(loopOutOfBox);

    excitementSmoothed += 0.04 * (AIexcitement - excitementSmoothed);
    AIboostSmoothed += 0.04 * (AIboost - AIboostSmoothed);

    // handling jumping / shaking
    killSmoothed -= dt * 0.0003 * killSmoothed;
    jumpingAmpSmoothed += 0.04 * (jumpingAmp - jumpingAmpSmoothed);
    jumpingFreqSmoothed += 0.04 * (jumpingFreq - jumpingFreqSmoothed);
    if (killSmoothed > 1.3) {
      if (jumpingAmp < 0.5) {
        jumpingFreq = 1 + Math.random();
        jumpingAmp++;
      }
    }
    if (killSmoothed < 0.8) {
      jumpingAmp = 0;
    }
    var prevPhase = jumpingPhase;
    jumpingPhase += (jumpingFreq * 2 * Math.PI * dt) / 1000;
    jumping = jumpingAmpSmoothed * Math.pow(Math.cos(jumpingPhase), 2.0);
    if (Math.cos(prevPhase) < 0 && 0 < Math.cos(jumpingPhase)) {
      jumpingFreq = 1 + 3 * Math.random() * Math.random();
    }
    if (jumpingAmp < 0.5) {
      jumpingAmpSmoothed += 0.04 * (jumpingAmp - jumpingAmpSmoothed);
    }

    var shake = jumpingAmp * Math.pow(smoothstep(0.2, 0.0, jumping), 0.5);
    if (shake > 0.5 && t - lastJump > 100) {
      play(Ajump);
      lastJump = t;
    }
    shaking = [
      (30 * shake * (Math.random() - 0.5)) / FW,
      (30 * shake * (Math.random() - 0.5)) / FH,
    ];
  }

  // Game DRAWING

  function drawGame() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    renderCollection(asteroids, drawAsteroid);
    renderCollection(ufos, drawUFO);
    renderCollection(bullets, drawBullet);
    renderCollection(particles, drawParticle);

    if (playingSince > 0 && !awaitingContinue && !gameOver) {
      ctx.save();
      translateTo(spaceship);
      drawSpaceship(spaceship);
      ctx.restore();
    }

    drawGameUI();

    drawGlitch();
  }

  function translateTo(p) {
    ctx.translate(p[0], p[1]);
  }

  function renderCollection(coll, draw) {
    for (var i = 0; i < coll.length; ++i) {
      ctx.save();
      translateTo(coll[i]);
      draw(coll[i]);
      ctx.restore();
    }
  }

  return {
    dispose: function () {
      cancelAnimationFrame(raf);
    },
    getWebGLParams: function () {
      var pt = playingSince / 1000;
      var pl = player;
      var ex = gameOver || excitementSmoothed;
      var J = jumping;
      var P = playingSince < 0 || gameOver || dying ? 0 : 1;
      var s = !player ? smoothstep(-4000, -3000, playingSince) : 1;
      var F =
        smoothstep(300, 0, t - lastLoseShot) + !gameOver && lifes > 4
          ? 0.5 * smoothstep(-1, 1, Math.cos(0.01 * t))
          : 0;
      var k = [shaking[0], shaking[1]];
      return {
        pt: pt,
        pl: pl,
        ex: ex,
        J: J,
        P: P,
        s: s,
        F: F,
        k: k,
        W: W,
        H: H,
        S: SEED,
      };
    },
  };
};
