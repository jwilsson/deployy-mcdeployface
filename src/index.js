'use strict';

const path = require('path');
const fs = require('fs');
const dns = require('dns');

const childProcess = require('child-process-promise');
const express = require('express');
const publicIp = require('public-ip');

const configPath = path.resolve(process.cwd(), process.argv.slice().pop());
const app = express();

let config = false;

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

        try {
            await childProcess.exec(commands[i], options);
        } catch (e) {
            if (config.stopOnError) {
                console.error(`Aborted due to error: ${ e.message }`);

                break;
            }
        }

        console.log('Done');
    }
}

function getHostname () {
    return new Promise((resolve, reject) => {
        publicIp.v4().then(ip => {
            let returnName = ip;

            dns.lookupService(ip, 80, (err, hostname, service) => {
                if(!err){
                    returnName = hostname;
                }

                resolve(returnName);
            });
        });
    });
}

app.post(config.path, (req, res) => {
    const target = req.query.target;

    if (config.repos[target]) {
        switch (req.get('x-github-event')){
            case 'push':
                build(target, config.repos[target]);
                res.status(200).send();
                break;
            case 'ping':
                res.status(204).send();
                break;
            default:
                res.status(401).send();
                break;
        }
    } else {
        res.status(400).send();
    }
});

if(configPath.length < 1 || configPath === __filename ){
    console.error('Didnt\'t get a config file, are you sure you specified one?');
    process.exit(1);
}

fs.access(configPath, fs.R_OK, (err) => {
    if(err){
        console.error('Unable to read file "', configPath, '". Please make sure it exists and is readable.');
        process.exit(1);
    }

    try {
        const defaults = {
            host: '0.0.0.0',
            path: '/',
            port: 80,
            repos: {},
            stopOnError: false,
        };

        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config = Object.assign(defaults, config);
    } catch (err){
        console.error('Unable to parse config file "' + configPath + '". Please make sure it\'s valid.');
        process.exit(1);
    }

    if(config){
        app.listen(config.port, async () => {
            let hostname = config.host;

            if (!hostname) {
                hostname = await getHostname();
            }

            console.log('Service up and running on port', config.port);
            console.log('Please add the following webhooks if they don\'t exist already');
            for(let repo in config.repos){
                console.log(repo, '| http://' + hostname + ':' + config.port + '/?target=' + repo);
            }
        });
    }
});
