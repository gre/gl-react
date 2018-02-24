# CONTRIBUTING

Contributions are always welcome, no matter how large or small.

## Requirement

* **Node 6**+
* [yarn](https://yarnpkg.com)

## Setup / Building

```sh
yarn
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

Finally, Please check that ALL examples of the cookbook are working correctly.

## Cookbook

**Run it**

```sh
cd packages/cookbook
yarn start
```

## License

By contributing to gl-react, you agree that your contributions will be licensed
under its [MIT license](LICENSE).
