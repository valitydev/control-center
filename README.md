# Control Center

## Installation

1. Add environment and configurations:

    - `.env`
        ```env
        PROXY_TARGET="https://<URL>"
        ```
    - `src/assets/appConfig.json`:
        ```json
        {
            "fileStorageEndpoint": "https://<URL>",
            "constants": {
                "currencies": [{ "source": "<ID>", "currency": "USD" }]
            }
        }
        ```
    - `src/assets/authConfig.json`:
        ```json
        {
            "realm": "internal",
            "auth-server-url": "https://<URL>",
            "ssl-required": "external",
            "resource": "control-center",
            "public-client": true
        }
        ```

2. Install packages
    ```sh
    npm ci
    ```

### Stage

Running in stage mode needs files:

-   `env.stage`
-   `src/assets/appConfig.stage.json`
-   `src/assets/authConfig.stage.json`

## Usage

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
