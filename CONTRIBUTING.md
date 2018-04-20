# Contributing

[![PRs Welcome][pr-welcome-badge]][pr-welcome-link]

Thank you for opening (and reading) this document. :)
We are open to, and grateful for, any contributions made.

## Semantic Versioning

This repository generally follows semantic versioning. We release patch versions for bug fixes, minor versions for new features, and major versions for any breaking changes.

All releases to npm or any other supported distribution channels will corresponding to a tagged commit.

## `yarn` vs `npm`

This repository currently uses `yarn` as a development tool, but you may use `npm` instead.

## Testing

To only run linting:

`yarn run lint`

To run tests and coverage:

`yarn test`

To continuously watch and run tests, run the following:

`yarn test:watch`

## Sending a Pull Request

If you send a pull request, please do it against the master branch.

Please __do not__ bump the version and tag your pull request with a v\[number\] as it corresponds to a release.

Before submitting a pull request, please make sure the following is done:

-   Fork the repository and create your branch from master.
-   If you've added code that should be tested, add tests!
-   Ensure the test suite passes (`yarn test`).
-   Make sure your code lints (`yarn lint`).

Thank you for contributing!

[pr-welcome-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[pr-welcome-link]: https://github.com/yeojz/filter-chunk-webpack-plugin/blob/master/CONTRIBUTING.md
