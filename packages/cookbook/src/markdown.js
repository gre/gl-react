import React from "react";
import remark from "remark";
import remarkReactRenderer from "remark-react";
const MD = remark().use(remarkReactRenderer);
function markdown(strings: Array<string>, ...values: Array<string>) {
  let contents = [];
  for (let i = 0; i < strings.length; i++) {
    if (i > 0) {
      contents = contents.concat(<div key={"v_" + i}>{values[i - 1]}</div>);
    }
    contents = contents.concat(
      <div key={i}>{MD.processSync(strings[i]).contents}</div>
    );
  }
  return contents;
}
export default markdown;
