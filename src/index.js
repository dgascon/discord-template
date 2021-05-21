const SClient = require('./Structures/SClient');
const config = require('../config.json');

const client = new SClient(config);
client.start();