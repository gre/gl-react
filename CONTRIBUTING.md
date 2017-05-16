# CONTRIBUTING

Contributions are always welcome, no matter how large or small.

## Requirement

[yarn](https://yarnpkg.com)

## Setup

```sh
git clone https://github.com/gre/gl-react.git       && cd gl-react

yarn
yarn run build
```

## Building

```sh
yarn run build
```

You must run this each time you modify one of the packages/ of the library.
It rebuild the lib/ folders and will copy the packages into the projects.

### Developing

```sh
yarn run watch
```

> For a faster reload experience, this do like `build` but only for a specific file you modify.

## Testing

```sh
yarn test
```

if you need to regenerate the snapshots:

```sh
yarn run test-rewrite-snapshots
```

typecheck:

```sh
yarn run flow
```

Finally, Please check that ALL examples of the cookbook are working correctly.

## Cookbook

**Run it**

```sh
cd packages/cookbook
yarn start
```

**Deploy** (only `gre` can do this at the moment!)

```sh
yarn run deploy-cookbook
```

## License

By contributing to gl-react, you agree that your contributions will be licensed
under its [MIT license](LICENSE).
