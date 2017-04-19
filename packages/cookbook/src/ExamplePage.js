import React, {PropTypes, Component} from "react";

const encodeQueryValue = value => JSON.stringify(value);
const decodeQueryValue = value => JSON.parse(value);
const encodeQuery = obj => {
  const values = {};
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      values[k] = encodeQueryValue(obj[k]);
    }
  }
  return values;
};
const decodeQuery = query => {
  query = { ...query };
  for (let k in query) {
    if (query.hasOwnProperty(k)) {
      try {
        query[k] = decodeQueryValue(query[k]);
      }
      catch (e) {
        console.warn(e);
        delete query[k];
      }
    }
  }
  return query;
};

export default class ExamplePage extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  setToolState = (obj: any) => {
    const { location: { pathname, query } } = this.props;
    this.context.router.replace({
      pathname,
      query: { ...query, ...encodeQuery(obj) }
    });
  };

  onChangeField = prop => value => this.setToolState({ [prop]: value });

  render() {
    const {
      route: { path, toolbox, ToolboxFooter, Example, desc, descAfter },
      location: { query }
    } = this.props;
    const props = {
      setToolState: this.setToolState,
      ...Example.defaultProps,
      ...decodeQuery(query),
    };
    return <div id={path} className="example">
      <div className="desc">{desc}</div>
      <div className="rendering">
        <Example {...props} />
      </div>
      { toolbox
        ? <div className="toolbox">
          {toolbox.map((field, i) =>
            <div key={i} className="field">
            { field.title
              ? <h3>{
                typeof field.title==="function"
                ? field.title(props[field.prop])
                : field.title
              }</h3>
              : null }
            { field.Editor
              ? <field.Editor
                  {...field}
                  value={props[field.prop]}
                  onChange={this.onChangeField(field.prop)}
                />
              : null }
            </div>)}
            { ToolboxFooter
              ? <ToolboxFooter {...props} />
              : null}
          </div>
        : null }
        <div className="desc">{descAfter}</div>
      </div>;
  }
}
