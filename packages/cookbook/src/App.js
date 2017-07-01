//@flow
import React, { PureComponent, Component } from "react";
import PropTypes from "prop-types";
import { findDOMNode } from "react-dom";
import "./App.css";
import { Link } from "react-router";
import logopng from "./logo.png";
import Code from "./Code";
import Sidebar from "react-sidebar";
import Inspector from "./Inspector";

const conf = {
  version: "3.6.0",
  githubprefix: "https://github.com/gre/gl-react/tree/master/packages/cookbook/"
};

function triggerLink(linkRef) {
  const dom = linkRef && findDOMNode(linkRef);
  if (dom) dom.click();
}

const lenseSidebar = ({ location: { query: { menu, inspector } } }) => ({
  menu,
  inspector
});

class MenuContext extends PureComponent {
  props: {
    examples: Array<*>,
    menu: boolean,
    inspector: boolean,
    currentExample: ?Object
  };
  render() {
    const { examples, menu, inspector } = this.props;
    return (
      <div>
        <h3>{examples.length} Examples</h3>
        <ul>
          {examples.map(ex => (
            <li key={ex.path}>
              <Link
                to={{ pathname: ex.path, query: { menu, inspector } }}
                activeClassName="active"
                className="example-link"
              >
                <strong>{ex.path}</strong>
                &nbsp;
                <span>{ex.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

class Header extends Component {
  props: {
    currentExample: ?Object,
    toToggleMenu: Object,
    toToggleInspector: Object
  };
  render() {
    const { currentExample, toToggleMenu, toToggleInspector } = this.props;
    return (
      <header>
        {currentExample
          ? <Link to={toToggleMenu} className="sidebar-opener">☰</Link>
          : null}
        <Link to="/" className="logo">
          <img alt="" src={logopng} />
          <span className="t1">gl</span>
          <span className="t2">-</span>
          <span className="t3">react</span>
          <span className="v">{conf.version}</span>
        </Link>
        <nav>
          <Link to="/api">
            API
          </Link>
          <Link
            to={
              currentExample && currentExample.path === "hellogl"
                ? "/hellogl?menu=true"
                : "/hellogl"
            }
          >
            Examples
          </Link>
          <a href="http://github.com/gre/gl-react">
            Github
          </a>
        </nav>
        <h1>
          {currentExample && currentExample.title}
        </h1>
        {currentExample
          ? <Link to={toToggleInspector} className="inspector-opener">☰</Link>
          : null}
      </header>
    );
  }
}

class App extends Component {
  props: {
    children: any,
    location: Object,
    routes: Array<*>,
    route: Object
  };
  static contextTypes = {
    router: PropTypes.object.isRequired
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
    const { children, location, route, routes } = this.props;
    const { menu, inspector } = lenseSidebar(this.props);
    const currentExample = routes[1].isExample ? routes[1] : null;
    const { LeftSidebar } = routes[1];
    const menuOpened = (LeftSidebar && !currentExample) || !!menu;
    const inspectorOpened = !!currentExample && !!inspector;
    const examples = route.childRoutes;
    const index = examples.indexOf(currentExample);
    let prev = examples[index - 1];
    if (prev && !prev.isExample) prev = null;
    let next = examples[index + 1];
    if (next && !next.isExample) next = null;
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
            currentExample
              ? <MenuContext
                  menu={menu}
                  inspector={inspector}
                  currentExample={currentExample}
                  examples={examples}
                />
              : LeftSidebar ? <LeftSidebar /> : <span />
          }
        >

          <Header
            currentExample={currentExample}
            toToggleMenu={{
              pathname: location.pathname,
              query: {
                ...location.query,
                menu: !menuOpened ? true : undefined,
                ...(!menuOpened ? { inspector: undefined } : null)
              }
            }}
            toToggleInspector={{
              pathname: location.pathname,
              query: {
                ...location.query,
                inspector: !inspectorOpened ? true : undefined,
                ...(!inspectorOpened ? { menu: undefined } : null)
              }
            }}
          />

          {prev
            ? <Link
                ref="left"
                className="left"
                to={{
                  pathname: prev.path,
                  query: { menu, inspector }
                }}
              >
                ❮
              </Link>
            : null}

          {next
            ? <Link
                ref="right"
                className="right"
                to={{
                  pathname: next.path,
                  query: { menu, inspector }
                }}
              >
                ❯
              </Link>
            : null}

          <div className="container">

            {children}

            {currentExample
              ? <div className="source">
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
              : null}
          </div>

        </Sidebar>
      </Sidebar>
    );
  }
}

export default App;
