# Deployy McDeployface

A simple, stupid Node-based deploy script working with GitHub Webhooks.

## Setup

```bash
git clone https://github.com/jwilsson/deployy-mcdeployface.git
cd deployy-mcdeployface/
npm install
npm run build
```

## Usage example
Running via [forever](https://github.com/foreverjs/forever):

```bash
forever start /path/to/deployy-mcdeployface/dist/index.js /path/to/config.json
```

Running via [pm2](http://pm2.keymetrics.io/):

```bash
pm2 start /path/to/deployy-mcdeployface/dist/index.js -- /path/to/config.json
```

When you start you will get a list of what webhooks to add to each repo.
The URL to ping should include a name of the repo in a `target` query string, `http://example.com:1234/?target=deployy-mcdeployface` will trigger a deploy for this script.

Then, whenever a push to a GitHub repo is made, this script will be pinged and perform the steps outlined for that repo.

For example:

```json
{
    "port": 1234,
    "host": "example.com",
    "path": "/deployy-mcdeployface",
    "stopOnError": true,
    "repos": {
        "deployy-mcdeployface": {
            "path": "/local/path/to/repo",
            "commands": [
                "git pull",
                "npm install",
                "npm run build"
            ]
        }
    }
}
```

## Response codes

| Code | Meaning                                                                                         |
|------|-------------------------------------------------------------------------------------------------|
| 200  | Got a valid GitHub push event                                                                   |
| 204  | Got a valid GitHub ping event                                                                   |
| 400  | Got a request without a target parameter                                                        |
| 401  | Got an invalid message either with an unsupported GitHub event or without a GitHub event header |
