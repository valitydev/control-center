# Control Center Monorepo

- Applications
    - Admin Dashboard
- Angular Libraries
    - MatEz (eazy-to-use library that extends Angular Material)
    - Configs (for Prettier, ESLint, CSpell)

## Control Center App

### ⚙️ Installation

1. Add configurations:

    - [`src/assets/appConfig.json`](./src/assets/_appConfig.json)
    - [`src/assets/authConfig.json`](./src/assets/_authConfig.json)

You can copy from examples like this one: [`_appConfig.json`](./src/assets/_appConfig.json)

2. Install packages
    ```sh
    npm ci
    ```

#### Stage

Running in stage mode needs files:

- `src/assets/appConfig.stage.json`
- `src/assets/authConfig.stage.json`

### 🚀 Launch

1. Start
    ```sh
    npm start
    ```
2. Open [localhost:4200](http://localhost:4200/)

If you want to develop a library, then it's better to start building library separately:

```sh
npm run dev
npm run dev-libs
```

### 👩‍💻 Development

#### Console Utilities

- `ccSwitchLogging()` - Enable/disable logging requests to the console
- `ccGetMyRoles()` - Display your roles from the token
