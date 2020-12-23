//@flow
import React, { PureComponent } from "react";
import "prismjs";
import "prismjs/plugins/autolinker/prism-autolinker";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-glsl";
import "prism-theme-one-dark/prism-onedark.css";
import { PrismCode } from "react-prism";
import "./Code.css";
const { Prism } = window;

// add GLSL synthax for GLSL blocks.
Prism.languages.insertBefore("jsx", "string", {
  "template-string": {
    pattern: /GLSL`(?:\\\\|\\?[^\\])*?`/,
    greedy: true,
    inside: {
      string: /GLSL`[\n]?|`/,
      "js-template-string-glsl": {
        pattern: /[^`]*/,
        inside: {
          rest: Prism.languages.glsl,
        },
      },
    },
  },
});

export default class Code extends PureComponent {
  props: {
    children?: any,
  };
  render() {
    const { children } = this.props;
    return (
      <pre className="cookbook-code">
        <PrismCode className="language-jsx">{children}</PrismCode>
      </pre>
    );
  }
}
