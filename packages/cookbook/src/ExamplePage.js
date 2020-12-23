import React, { Component } from "react";
import queryString from "query-string";

const encodeQueryValue = (value) => JSON.stringify(value);
const decodeQueryValue = (value) => JSON.parse(value);
const encodeQuery = (obj) => {
  const values = {};
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      values[k] = encodeQueryValue(obj[k]);
    }
  }
  return values;
};
const decodeQuery = (query) => {
  query = { ...query };
  for (let k in query) {
    if (query.hasOwnProperty(k)) {
      try {
        query[k] = decodeQueryValue(query[k]);
      } catch (e) {
        console.warn(e);
        delete query[k];
      }
    }
  }
  return query;
};

export default class ExamplePage extends Component {
  setToolState = (obj: any) => {
    const {
      location: { pathname, search },
    } = this.props;
    this.props.history.replace({
      pathname,
      search: queryString.stringify({
        ...queryString.parse(search),
        ...encodeQuery(obj),
      }),
    });
  };

  onChangeField = (prop) => (value) => this.setToolState({ [prop]: value });

  render() {
    const {
      example: { toolbox, ToolboxFooter, Example, desc, descAfter },
      location: { search },
    } = this.props;
    const props = {
      setToolState: this.setToolState,
      ...Example.defaultProps,
      ...decodeQuery(queryString.parse(search)),
    };
    return (
      <div className="example">
        <div className="desc">{desc}</div>
        <div className="rendering">
          <Example {...props} />
        </div>
        {toolbox ? (
          <div className="toolbox">
            {toolbox.map((field, i) => (
              <div key={i} className="field">
                {field.title ? (
                  <h3>
                    {typeof field.title === "function"
                      ? field.title(props[field.prop])
                      : field.title}
                  </h3>
                ) : null}
                {field.Editor ? (
                  <field.Editor
                    {...field}
                    value={props[field.prop]}
                    onChange={this.onChangeField(field.prop)}
                  />
                ) : null}
              </div>
            ))}
            {ToolboxFooter ? <ToolboxFooter {...props} /> : null}
          </div>
        ) : null}
        <div className="desc">{descAfter}</div>
      </div>
    );
  }
}
