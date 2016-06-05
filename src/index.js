'use strict';

const childProcess = require('child-process-promise');
const express = require('express');
const path = require('path');
const fs = require('fs');

const configPath = path.resolve(process.cwd(), process.argv.slice().pop());
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = express();

async function build (args) {
    const commands = args.commands;
    const options = {
        cwd: args.path,
    };

    for (let i = 0; i < commands.length; i++) {
        console.log(`Running ${ commands[i] }...`);
        await childProcess.exec(commands[i], options);
        console.log('Done');
    }
}

app.post('/', (req, res) => {
    const target = req.query.target;

    if (config.repos[target]) {
        build(config.repos[target]);
    }

    res.status(200).send();
});

app.listen(config.port, config.host);
