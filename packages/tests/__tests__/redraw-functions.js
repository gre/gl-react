//@flow

import { LinearCopy, NearestCopy, Visitor, Bus } from "gl-react";
import { Surface } from "gl-react-headless";
import { act } from "react-test-renderer";
import React from "react";
import invariant from "invariant";
import {
  create,
  red2x2,
  white3x3,
  yellow3x3,
  expectToBeCloseToColorArray
} from "../utils";

test("Bus redraw=>el function", () => {
  let surface, updatingTexture;
  class UpdatingTexture extends React.Component<{
    redraw: Function,
    initialPixels: any,
    initialWidth: number,
    initialHeight: number
  }> {
    static defaultProps = {
      initialWidth: 2,
      initialHeight: 2
    };
    pixels = this.props.initialPixels;
    faketexture = React.createRef();
    setPixels = (pixels, w, h) => {
      this.pixels = pixels;
      this.faketexture.current.width = w;
      this.faketexture.current.height = h;
      this.props.redraw();
    };
    getPixels = () => this.pixels;
    getRootRef = () => this.faketexture.current;
    render() {
      return (
        <faketexture
          ref={this.faketexture}
          width={this.props.initialWidth}
          height={this.props.initialHeight}
          getPixels={this.getPixels}
        />
      );
    }
  }

  const Example = () => {
    const bus = React.createRef();
    return (
      <Surface
        ref={ref => (surface = ref)}
        width={4}
        height={4}
        visitor={new Visitor()}
        webglContextAttributes={{ preserveDrawingBuffer: true }}
      >
        <Bus ref={bus}>
          {redraw => (
            <UpdatingTexture
              initialPixels={yellow3x3}
              initialWidth={3}
              initialHeight={3}
              ref={ref => (updatingTexture = ref)}
              redraw={redraw}
            />
          )}
        </Bus>
        <NearestCopy>
          <LinearCopy>{() => bus.current}</LinearCopy>
        </NearestCopy>
      </Surface>
    );
  };

  let inst;
  act(() => {
    inst = create(<Example />);
  });
  invariant(surface, "surface is defined");
  invariant(updatingTexture, "updatingTexture is defined");
  expectToBeCloseToColorArray(
    surface.capture(2, 2, 1, 1).data,
    new Uint8Array([255, 255, 0, 255])
  );
  updatingTexture.setPixels(red2x2, 2, 2);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(2, 2, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  act(() => {
    inst.unmount();
  });
});

test("Uniform children redraw=>el function", () => {
  let surface, updatingTexture;
  class UpdatingTexture extends React.Component<{
    redraw: Function
  }> {
    pixels = null;
    faketexture = React.createRef();
    setPixels = (pixels, w, h) => {
      this.pixels = pixels;
      this.faketexture.current.width = w;
      this.faketexture.current.height = h;
      this.props.redraw();
    };
    getPixels = () => this.pixels;
    getRootRef = () => this.faketexture.current;
    render() {
      return (
        <faketexture
          ref={this.faketexture}
          width={0}
          height={0}
          getPixels={this.getPixels}
        />
      );
    }
  }
  class Example extends React.Component<*> {
    render() {
      return (
        <Surface
          ref={ref => (surface = ref)}
          width={4}
          height={4}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <NearestCopy>
            <LinearCopy>
              {redraw => (
                <UpdatingTexture
                  ref={ref => (updatingTexture = ref)}
                  redraw={redraw}
                />
              )}
            </LinearCopy>
          </NearestCopy>
        </Surface>
      );
    }
  }
  let inst;
  act(() => {
    inst = create(<Example />);
  });
  invariant(surface, "surface is defined");
  invariant(updatingTexture, "updatingTexture is defined");
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  act(() => {
    inst.update(<Example />);
  });
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  updatingTexture.setPixels(red2x2, 2, 2);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  updatingTexture.setPixels(white3x3, 3, 3);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([255, 255, 255, 255])
  );
  updatingTexture.setPixels(yellow3x3, 3, 3);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(2, 2, 1, 1).data,
    new Uint8Array([255, 255, 0, 255])
  );
  act(() => {
    inst.unmount();
  });
});
