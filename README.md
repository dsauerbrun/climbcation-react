This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Environment configuration

Two committed env files supply the backend origin:

| File | Used by | `REACT_APP_API_ORIGIN` |
|------|---------|------------------------|
| `.env.development` | `npm start` | `https://localhost:3000` |
| `.env.production` | `npm run build` | `https://www.climbcation.com` |

CRA picks the file automatically from the command you run — there is no runtime switch and
nothing to set by hand.

Both files are committed on purpose. They hold no secrets, and the app needs the same values on
every machine. For a local override that should not be committed, use `.env.development.local`;
`.gitignore` already excludes every `*.local` variant.

### Adding a variable

Only names beginning with `REACT_APP_` are exposed to the app — CRA ignores anything else. Read
them as `process.env.REACT_APP_WHATEVER`.

**The value is substituted at build time, not read at runtime.** Editing an env file therefore
has no effect on an already-running dev server: you must stop and re-run `npm start`. Source
edits still hot-reload as usual, so a stale env is easy to miss — the variable comes through as
`undefined` while the rest of your change appears to have taken.

### Why the dev origin is not the dev server

Most API calls use relative paths (`/api/...`) and go through the dev proxy configured by
`"proxy"` in `package.json`, which forwards them to the backend. That works because they are
XHRs.

`REACT_APP_API_ORIGIN` exists for the cases that cannot use the proxy — currently the Google
sign-in links in `src/components/Login.tsx`. Starting OAuth is a full-page navigation rather
than an XHR, and the proxy deliberately does not forward navigation requests: it serves
`index.html` instead, so the browser would land on the app's 404 page. Those links must point
at the backend's own origin.

Because the browser then talks to the backend directly rather than through the proxy, it meets
the backend's self-signed certificate. Visit <https://localhost:3000> once and accept the
warning, or the navigation will fail.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
