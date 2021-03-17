const Discord = require('discord.js');
const {
    readFileSync,
    writeFileSync
} = require('fs');
const axios = require('axios');
const client = new Discord.Client();
const secret = require('./secret.json');
const config = require('./config.json');

function checkIfItWentOnline() {
    axios.get('https://api.hypixel.net/player', {
            params: {
                uuid: config.uuid,
            },
            headers: {
                "API-Key": secret['API-Key'],
            }
        })
        .then(function (response) {
            const lastLogin = response.data.player.lastLogin;
            let oldLastLogin = lastLogin;
            try {
                oldLastLogin = readFileSync(`${__dirname}/lastLogin.cache`, {
                    flag: 'rs+',
                    encoding: 'utf-8',
                });
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log(`lastLogin.cache is not found so creating new one with data "NEW: ${lastLogin}"`);
                    writeFileSync(`${__dirname}/lastLogin.cache`, String(lastLogin), 'utf8');
                } else {
                    console.log(err);
                }
            }

            if (lastLogin > oldLastLogin) {
                console.log(`OLD: ${oldLastLogin}, NEW: ${lastLogin}`);
                client.channels.cache.get(config.mentionChannel).send(`<@${config.userIDToMention}>`);
                writeFileSync(`${__dirname}/lastLogin.cache`, String(lastLogin), 'utf8');
            } else if (lastLogin < oldLastLogin) {
                writeFileSync(`${__dirname}/lastLogin.cache`, String(lastLogin), 'utf8');
            }
            // else player wasn't online, don't do anything
        })
        .catch(function (error) {
            console.log(error);
        });
}

client.once('ready', () => {
    console.log(`Ready as ${client.user.tag}`);
    checkIfItWentOnline();
    setInterval(checkIfItWentOnline, 2000);
});

client.login(secret.token);
