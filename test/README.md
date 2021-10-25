### Running Tests

First, install test dependencies with `npm install`, then start the test server with `npm test`. Go to `http://localhost:5000` and click run tests.

Tests are run in the browser using Mocha. However, the tests that rely on snapshots have to have access to the filesystem. That's the only real purpose of `test_server.js`. It allows tests to save snapshots to disk.

For more information on how tests are structured, read `test/public/index.html`.
