# Control Center Monorepo

- **Applications**
    - Admin Dashboard
- **Angular Libraries**
    - MatEz (eazy-to-use library that extends Angular Material)
    - Configs (for Prettier, ESLint, CSpell)

---

## Control Center App

### ⚙️ Installation

1. Add configurations:

    - [`apps/control-center/src/assets/appConfig.json`](./apps/control-center/src/assets/_appConfig.json)
    - [`apps/control-center/src/assets/authConfig.json`](./apps/control-center/src/assets/_authConfig.json)

You can copy from examples like this one: [`_appConfig.json`](./apps/control-center/src/assets/_appConfig.json)

2. Install packages
    ```sh
    npm ci
    ```

#### Stage

Running in stage mode needs files:

- `apps/control-center/src/assets/appConfig.stage.json`
- `apps/control-center/src/assets/authConfig.stage.json`

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

---

## [Update](https://nx.dev/features/automate-updating-dependencies#automate-updating-dependencies)

```sh
nx migrate latest
nx migrate --run-migrations
rm migrations.json
```
