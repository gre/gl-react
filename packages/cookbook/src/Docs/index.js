//@flow
// NB This is our custom version of documentation html renderer.
// everything is intentionally inlined here so we can do custom things.

import React, { Component, PureComponent } from "react";
import GithubSlugger from "github-slugger";
import remark from "remark";
import remarkReactRenderer from "remark-react";
import "./style.css";
import Code from "../Code";
import API from "../API.json";
import DocIntroMDBase64 from "../DocIntro.md";

const mdheader = "data:text/x-markdown;base64,";
const DocIntroMD =
  DocIntroMDBase64.indexOf(mdheader) === 0
    ? atob(DocIntroMDBase64.slice(mdheader.length))
    : "";

const paths = {
  Component: "https://facebook.github.io/react/docs/react-component.html",
  WebGLRenderingContext:
    "https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14",
  WebGLContextAttributes:
    "https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2",
};
API.forEach((doc) => {
  paths[doc.name] = "#" + slug(doc.name);
});

function getHref(text: string) {
  return text in paths ? paths[text] : null;
}

function t(text) {
  return <span>{text}</span>;
}

function visit(tree, type, visitor, reverse) {
  if (typeof type === "function") {
    reverse = visitor;
    visitor = type;
    type = null;
  }
  function all(children, parent) {
    var step = reverse ? -1 : 1;
    var max = children.length;
    var min = -1;
    var index = (reverse ? max : min) + step;
    var child;
    while (index > min && index < max) {
      child = children[index];
      if (child && one(child, index, parent) === false) {
        return false;
      }
      index += step;
    }
    return true;
  }
  function one(node, index, parent) {
    var result;
    index = index || (parent ? 0 : null);
    if (!type || node.type === type) {
      result = visitor(node, index, parent || null);
    }
    if (node.children && result !== false) {
      return all(node.children, node);
    }
    return result;
  }
  one(tree);
}

function rerouteLinks(ast) {
  visit(ast, "link", function (node) {
    if (
      node.jsdoc &&
      !node.url.match(/^(http|https|\.)/) &&
      getHref(node.url)
    ) {
      node.url = getHref(node.url);
    }
  });
  return ast;
}

function autolink(text) {
  var href = getHref(text);
  if (href) {
    return <a href={href}>{text}</a>;
  }
  return t(text);
}

function commaList(getHref, items, start, end, sep) {
  var res = [];
  if (start) {
    res.push(t(start));
  }
  for (var i = 0, iz = items.length; i < iz; ++i) {
    res = res.concat(formatType(items[i]));
    if (i + 1 !== iz) {
      res.push(t(sep || ", "));
    }
  }
  if (end) {
    res.push(t(end));
  }
  return res;
}

function decorate(formatted, str, prefix) {
  if (prefix) {
    return [t(str)].concat(formatted);
  }
  return formatted.concat(t(str));
}

function formatType(node) {
  var result = [];

  if (!node) {
    return [t("any")];
  }

  switch (node.type) {
    case "NullableLiteral":
      return [t("?")];
    case "AllLiteral":
      return [t("any")];
    case "NullLiteral":
      return [t("null")];
    case "VoidLiteral":
      return [t("void")];
    case "UndefinedLiteral":
      return [autolink("undefined")];
    case "NameExpression":
      return [autolink(node.name)];
    case "ParameterType":
      return [t(node.name + ": ")].concat(formatType(node.expression));

    case "TypeApplication":
      return formatType(node.expression).concat(
        commaList(getHref, node.applications, "<", ">")
      );
    case "UnionType":
      return commaList(getHref, node.elements, "(", ")", " | ");
    case "ArrayType":
      return commaList(getHref, node.elements, "[", "]");
    case "RecordType":
      return commaList(getHref, node.fields, "{", "}");

    case "FieldType":
      if (node.value) {
        return [t(node.key + ": ")].concat(formatType(node.value));
      }
      return [t(node.key)];

    case "FunctionType":
      result = [t("function (")];
      if (node["this"]) {
        if (node["new"]) {
          result.push(t("new: "));
        } else {
          result.push(t("this: "));
        }
        result = result.concat(formatType(node["this"]));
        if (node.params.length !== 0) {
          result.push(t(", "));
        }
      }
      result = result.concat(commaList(getHref, node.params, "", ")"));
      if (node.result) {
        result = result.concat([t(": ")].concat(formatType(node.result)));
      }
      return result;

    case "RestType":
      return ["...", formatType(node.expression)];
    case "OptionalType":
      return ["optional ", formatType(node.expression)].concat(
        node.default ? t("(default " + node.default + ")") : []
      );
    case "NonNullableType":
      return decorate(formatType(node.expression), "!", node.prefix);
    case "NullableType":
      return decorate(formatType(node.expression), "?", node.prefix);
    case "StringLiteralType":
      return [<code>{JSON.stringify(node.value)}</code>];
    case "NumericLiteralType":
    case "BooleanLiteralType":
      return [<code>{String(node.value)}</code>];

    default:
      throw new Error("Unknown type " + node.type);
  }
}

function parameter(param, short) {
  if (short) {
    return param.type && param.type.type === "OptionalType"
      ? "[" + param.name + "]"
      : param.name;
  }
  return [param.name + ": ", formatType(param.type)];
}

function parameters(section, short) {
  if (section.params) {
    return ["("]
      .concat(
        section.params.map((param, i) => [
          i === 0 ? "" : ", ",
          parameter(param, short),
        ])
      )
      .concat([")"]);
  }
  return "()";
}

function slug(str) {
  var slugger = new GithubSlugger();
  return slugger.slug(str);
}

const MD = remark().use(remarkReactRenderer);

function md(ast, inline) {
  if (
    inline &&
    ast &&
    ast.children.length &&
    ast.children[0].type === "paragraph"
  ) {
    ast = {
      type: "root",
      children: ast.children[0].children.concat(ast.children.slice(1)),
    };
  }
  if (ast) ast = rerouteLinks(ast);
  if (!ast) return;
  const root = MD.stringify(ast);
  if (inline) {
    return <span className="md">{root.props.children}</span>;
  }
  return <div className="md">{root}</div>;
}

function signature(section) {
  var returns = "";
  var prefix = "";
  if (section.kind === "class") {
    prefix = "new ";
  } else if (section.kind !== "function") {
    return section.name;
  }
  if (section.returns && section.returns.length > 0) {
    returns = [": ", formatType(section.returns[0].type)];
  }
  return [prefix + section.name, parameters(section), returns];
}

function isReactComponent(section) {
  return (
    section.augments && section.augments.some((a) => a.name === "Component")
  );
}

function shortSignature(section) {
  var prefix = "";
  if (section.kind === "class") {
    if (isReactComponent(section)) {
      const props = (section.properties || [])
        .filter((p) => p.type && p.type.type !== "OptionalType")
        .map((p) => p.name);
      const attrs = props
        .filter((name) => name !== "children")
        .map((name) => " " + name + "={..}")
        .join("");
      const hasChildren = props.some((name) => name === "children");
      return (
        "<" +
        section.name +
        attrs +
        (hasChildren ? ">\n  ...\n</" + section.name + ">" : " />")
      );
    } else {
      prefix = "new ";
    }
  } else if (section.kind !== "function") {
    return;
  }
  return [prefix + section.name, parameters(section, true)];
}

function highlight(code) {
  return code ? <Code>{code}</Code> : null;
}

class DocSectionList extends PureComponent {
  render() {
    const { members } = this.props;
    return (
      <div>
        {members.map((member, i) => (
          <div key={i} className="member" id={member.namespace}>
            <div className="member-title">
              <code>.{signature(member)}</code>
            </div>
            <DocSection section={member} nested />
          </div>
        ))}
      </div>
    );
  }
}

class DocSection extends PureComponent {
  render() {
    const { section, nested } = this.props;
    return (
      <section
        id={slug(section.namespace)}
        className={"section " + (nested ? "nested" : "")}
      >
        {!nested || (section.context && section.context.github) ? (
          <div>
            {!nested ? (
              <h3>
                <a href={"#" + slug(section.namespace)}>{section.name}</a>

                {section.augments ? (
                  <span className="augments">
                    &nbsp;extends&nbsp;
                    {section.augments
                      ? section.augments.map((tag, i) => (
                          <span key={i}>
                            {i === 0 ? "" : ", "}
                            {autolink(tag.name)}
                          </span>
                        ))
                      : null}
                  </span>
                ) : null}

                {section.context && section.context.github ? (
                  <a className="github-link" href={section.context.github}>
                    {section.context.path}
                  </a>
                ) : null}
              </h3>
            ) : null}

            {!nested ? highlight(shortSignature(section)) : null}
          </div>
        ) : null}

        {md(section.description)}

        {section.version ? <div>Version: {section.version}</div> : null}
        {section.license ? <div>License: {section.license}</div> : null}
        {section.author ? <div>Author: {section.author}</div> : null}
        {section.copyright ? <div>Copyright: {section.copyright}</div> : null}
        {section.since ? <div>Since: {section.since}</div> : null}

        {section.params ? (
          <div>
            <h4>Parameters</h4>
            <div>
              {section.params.map((param, i) => (
                <div key={i}>
                  <div>
                    <strong>
                      <code>{param.name}</code>
                    </strong>
                    &nbsp;
                    <code className="type">
                      ({formatType(param.type)}
                      {param.default ? (
                        <span>
                          (default <code>{param.default}</code>)
                        </span>
                      ) : null}
                      )
                    </code>
                    {md(param.description, true)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {section.properties ? (
          <div>
            <h4>{isReactComponent(section) ? "Props" : "Properties"}</h4>
            <ul className="props">
              {section.properties.map((property, i) => (
                <li key={i} className="prop">
                  <strong>
                    <code>{property.name}</code>
                  </strong>
                  &nbsp;
                  <code className="type">({formatType(property.type)})</code>
                  {property.default ? (
                    <span>
                      (default <code>{property.default}</code>)
                    </span>
                  ) : null}
                  {property.description
                    ? [": ", md(property.description, true)]
                    : null}
                  {property.properties ? (
                    <ul>
                      {property.properties.map((property, i) => (
                        <li key={i}>
                          <code>{property.name}</code>
                          &nbsp;
                          {formatType(property.type)}
                          {property.default ? (
                            <span>
                              (default <code>{property.default}</code>)
                            </span>
                          ) : null}
                          {md(property.description)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {section.returns
          ? section.returns.map((ret, i) => (
              <div key={i}>
                <h4>Returns</h4>
                <code>{formatType(ret.type)}</code>
                {ret.description ? md(ret.description, true) : null}
              </div>
            ))
          : null}

        {section.throws ? (
          <div>
            <h4>Throws</h4>
            <ul>
              {section.throws.map((throws, i) => (
                <li key={i}>
                  {formatType(throws.type)}
                  {": "}
                  {md(throws.description, true)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {section.examples ? (
          <div>
            <h4>Example{section.examples.length > 1 ? "s" : ""}</h4>
            {section.examples.map((example, i) => (
              <div key={i}>
                {example.caption ? <p>{md(example.caption)}</p> : null}
                {highlight(example.description)}
              </div>
            ))}
          </div>
        ) : null}

        {section.members.static && section.members.static.length ? (
          <div>
            <h4>Static Members</h4>
            <DocSectionList
              members={section.members.static}
              noun="Static Member"
            />
          </div>
        ) : null}

        {section.members.instance && section.members.instance.length ? (
          <div>
            <h4>Instance Members</h4>
            <DocSectionList
              members={section.members.instance}
              noun="Instance Member"
            />
          </div>
        ) : null}

        {section.members.events && section.members.events.length ? (
          <div>
            <h4>Events</h4>
            <DocSectionList members={section.members.events} noun="Event" />
          </div>
        ) : null}
      </section>
    );
  }
}

class DocIntro extends Component {
  render() {
    return MD.processSync(DocIntroMD).contents;
  }
}

class DocBody extends Component {
  render() {
    return (
      <div>
        <div className="intro" id="summary">
          <DocIntro />
        </div>
        {API.map((s, i) =>
          s.kind !== "note" ? <DocSection key={i} section={s} /> : null
        )}
      </div>
    );
  }
}

class Doc extends PureComponent {
  render() {
    return (
      <div className="documentation">
        <DocBody />
      </div>
    );
  }
}
export class DocToc extends Component {
  render() {
    return (
      <div className="documentation-toc">
        <a href="#summary">gl-react</a>
        <ul>
          {API.map((doc, i) => (
            <li
              key={i}
              className={[
                "kind-" + doc.kind,
                isReactComponent(doc) ? "react-component" : "",
              ].join(" ")}
            >
              <a href={"#" + slug(doc.namespace)}>{doc.name}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default class Screen extends Component {
  render() {
    return <Doc />;
  }
}
