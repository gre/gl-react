//@flow
import React, { PureComponent, Component } from "react";
import PropTypes from "prop-types";
import { findDOMNode } from "react-dom";
import queryString from "query-string";
import "./App.css";
import { NavLink, Link, Route, Switch } from "react-router-dom";
import logopng from "./logo.png";
import Code from "./Code";
import Sidebar from "react-sidebar";
import Inspector from "./Inspector";
import examples from "./examples";
import ExamplePage from "./ExamplePage";
import Docs, { DocToc } from "./Docs";
import Dashboard from "./Dashboard";

const conf = {
  version: process.env.REACT_APP_GL_VERSION,
  githubprefix:
    "https://github.com/gre/gl-react/tree/master/packages/cookbook/",
};

function triggerLink(linkRef) {
  const dom = linkRef && findDOMNode(linkRef);
  if (dom) dom.click();
}

const lenseSidebar = ({ location }) => {
  const { menu, inspector } = queryString.parse(location.search);
  return {
    menu,
    inspector,
  };
};

class MenuContext extends PureComponent<*> {
  props: {
    menu: boolean,
    inspector: boolean,
    currentExample: ?Object,
  };
  render() {
    const { menu, inspector } = this.props;
    const all = Object.keys(examples);
    return (
      <div>
        <h3>{all.length} Examples</h3>
        <ul>
          {all.map((key) => (
            <li key={key}>
              <NavLink
                to={{
                  pathname: "/" + key,
                  search: queryString.stringify({ menu, inspector }),
                }}
                activeClassName="active"
                className="example-link"
              >
                <strong>{key}</strong>
                &nbsp;
                <span>{examples[key].title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

class Header extends Component<*> {
  props: {
    currentExample: ?Object,
    toToggleMenu: Object,
    toToggleInspector: Object,
  };
  render() {
    const { currentExample, toToggleMenu, toToggleInspector } = this.props;
    return (
      <header>
        {currentExample ? (
          <Link to={toToggleMenu} className="sidebar-opener">
            ☰
          </Link>
        ) : null}
        <Link to="/" className="logo">
          <img alt="" src={logopng} />
          <span className="t1">gl</span>
          <span className="t2">-</span>
          <span className="t3">react</span>
          <span className="v">{conf.version}</span>
        </Link>
        <nav>
          <Link to="/api">API</Link>
          <Link
            to={
              currentExample && currentExample.path === "hellogl"
                ? "/hellogl?menu=true"
                : "/hellogl"
            }
          >
            Examples
          </Link>
          <a href="http://github.com/gre/gl-react">Github</a>
        </nav>
        <h1>{currentExample && currentExample.title}</h1>
        {currentExample ? (
          <Link to={toToggleInspector} className="inspector-opener">
            ☰
          </Link>
        ) : null}
      </header>
    );
  }
}

class App extends Component<*> {
  props: {
    location: Object,
  };

  componentDidMount() {
    document.addEventListener("keydown", this.keydown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keydown);
  }

  keydown = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case 37:
        return e.metaKey && e.shiftKey && triggerLink(this.refs.left);
      case 39:
        return e.metaKey && e.shiftKey && triggerLink(this.refs.right);
      default:
    }
  };

  render() {
    const { location } = this.props;
    const m = location.pathname.match(/\/([^/]+)/);
    const firstPathPart = (m && m[1]) || "";
    const { menu, inspector } = lenseSidebar(this.props);
    const currentExample = examples[firstPathPart];
    const menuOpened = firstPathPart === "api" || !!menu;
    const inspectorOpened = !!currentExample && !!inspector;
    const examplesKeys = Object.keys(examples);
    const index = examplesKeys.indexOf(firstPathPart);
    let prev = examplesKeys[index - 1];
    let next = examplesKeys[index + 1];
    const query = queryString.parse(location.search);
    return (
      <Sidebar
        docked={inspectorOpened}
        pullRight
        sidebarClassName="inspector"
        sidebar={inspectorOpened ? <Inspector /> : <span />}
      >
        <Sidebar
          docked={menuOpened}
          contentClassName="App"
          sidebarClassName="menu"
          sidebar={
            currentExample ? (
              <MenuContext
                menu={menu}
                inspector={inspector}
                currentExample={currentExample}
              />
            ) : (
              <Switch>
                <Route path="/api" component={DocToc} />
                <Route render={() => <span />} />
              </Switch>
            )
          }
        >
          <Header
            currentExample={currentExample}
            toToggleMenu={{
              pathname: location.pathname,
              search: queryString.stringify({
                ...query,
                menu: !menuOpened ? true : undefined,
                ...(!menuOpened ? { inspector: undefined } : null),
              }),
            }}
            toToggleInspector={{
              pathname: location.pathname,
              search: queryString.stringify({
                ...query,
                inspector: !inspectorOpened ? true : undefined,
                ...(!inspectorOpened ? { menu: undefined } : null),
              }),
            }}
          />

          {prev ? (
            <Link
              ref="left"
              className="left"
              to={{
                pathname: prev,
                search: queryString.stringify({ menu, inspector }),
              }}
            >
              ❮
            </Link>
          ) : null}

          {next ? (
            <Link
              ref="right"
              className="right"
              to={{
                pathname: next,
                search: queryString.stringify({ menu, inspector }),
              }}
            >
              ❯
            </Link>
          ) : null}

          <div className="container">
            <Switch>
              <Route path="/" exact component={Dashboard} />
              {Object.keys(examples).map((key) => (
                <Route
                  path={"/" + key}
                  key={key}
                  isExample
                  render={(props) => (
                    <ExamplePage example={examples[key]} {...props} />
                  )}
                />
              ))}
              <Route path="/api" component={Docs} />
            </Switch>

            {currentExample ? (
              <div className="source">
                <Code>{currentExample.source}</Code>
                <a
                  className="viewsource"
                  href={
                    conf.githubprefix + "src/examples/" + currentExample.path
                  }
                >
                  view source
                </a>
              </div>
            ) : null}
          </div>
        </Sidebar>
      </Sidebar>
    );
  }
}

export default App;
