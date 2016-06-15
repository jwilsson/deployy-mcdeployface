'use strict';

const childProcess = require('child-process-promise');
const express = require('express');
const path = require('path');
const fs = require('fs');

const configPath = path.resolve(process.cwd(), process.argv.slice().pop());
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = express();

async function build (target, args) {
    const commands = args.commands;
    const options = {
        cwd: args.path,
    };

    console.log(`Deploying ${ target }...`);

    for (let i = 0; i < commands.length; i++) {
        const date = (new Date()).toLocaleDateString('sv-SE', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        console.log(`${ date } Running ${ commands[i] }...`);
        await childProcess.exec(commands[i], options);
        console.log('Done');
    }
}

app.post('/', (req, res) => {
    const target = req.query.target;

    if (config.repos[target]) {
        if(req.get('HTTP_X_GITHUB_EVENT') && req.get('HTTP_X_GITHUB_EVENT') === 'push'){
            build(target, config.repos[target]);
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } else {
        res.status(400).send();
    }
});

app.listen(config.port, config.host);
