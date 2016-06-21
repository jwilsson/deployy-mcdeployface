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
Running and watching it via [forever](https://github.com/foreverjs/forever):

```bash
forever start --watch --watchDirectory dist dist/index.js /path/to/config.json
```

Running and watching it via [pm2](http://pm2.keymetrics.io/):

```bash
pm2 start --watch dist/ start dist/index.js -- /path/to/config.json
```

Then, whenever a push to a GitHub repo is made, this script will be pinged and perform the steps outlined for that repo.

For example:

```json
{
    "host": "example.com",
    "port": 1234,
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

The URL to ping should include a name of the repo in a `target` query string, `http://example.com:1234/?target=deployy-mcdeployface` will trigger a deploy for this script.
