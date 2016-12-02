# CONTRIBUTING

Contributions are always welcome, no matter how large or small.

## Setup

```sh
git clone https://github.com/gre/gl-react.git
npm run install-all
npm run build
```

## Building

```sh
npm run build
```

You must run this each time you modify one of the packages/ of the library.
It rebuild the lib/ folders and will copy the packages into the projects.

## Testing

```sh
npm test
```

if you need to regenerate the snapshots:

```sh
npm run test-rewrite-snapshots
```

typecheck:

```sh
npm run flow
```

Finally, Please check that ALL examples of the cookbook are working correctly.

## Cookbook

**Run it**

```sh
cd cookbook
npm start
```

**Deploy** (only `gre` can do this at the moment!)

```sh
npm run deploy-cookbook
```

## Clean up and reinstall everything

```sh
npm run clean-all
npm run install-all
```

## License

By contributing to gl-react, you agree that your contributions will be licensed
under its [MIT license](LICENSE).
