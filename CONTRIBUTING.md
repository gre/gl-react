# CONTRIBUTING

Contributions are always welcome, no matter how large or small.

## Requirement

* **Node 6**+
* [pnpm](https://pnpm.io)

## Setup / Building

```sh
pnpm install
```

You must run this each time you modify one of the packages/ of the library.
It rebuild the lib/ folders and will copy the packages into the projects.

### Developing

```sh
pnpm watch
```

> For a faster reload experience, this do like `build` but only for a specific file you modify.

## Testing

```sh
pnpm test
```

if you need to regenerate the snapshots:

```sh
pnpm test-rewrite-snapshots
```

Finally, please check that all examples of the cookbook are working correctly.

## Cookbook

**Run it**

```sh
pnpm cookbook
```

## License

By contributing to gl-react, you agree that your contributions will be licensed
under its [MIT license](LICENSE).
