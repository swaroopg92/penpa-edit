### Running Tests

- Install Node.js at https://nodejs.org/en/download/
- Install Node dependencies with `npm install` in the terminal.
- Start the test server with `npm test`.
- Go to `http://localhost:5000` and click "run tests".
- If you change files you might have to reload the page to run the new tests.

Tests are run in the browser using Mocha. However, the tests that rely on snapshots have to have access to the filesystem. That's the only real purpose of `test_server.js`. It allows tests to save snapshots to disk.

Tests are a WIP. For more information on how tests are structured, read `test/public/index.html`.
