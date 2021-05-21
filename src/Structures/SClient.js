const { Client, Collection } = require('discord.js')
const Util = require('./Util.js');

/**
 * Personnal client based on Client of DiscordJS
 * @type {SClient}
 */
module.exports = class SClient extends Client {
	constructor(options = {}) {
		super({
			disableMentions: 'everyone'
		});
		this.validate(options);

		this.commands = new Collection();

		this.aliases = new Collection();

		this.events = new Collection();

		this.utils = new Util(this);

		this.owners = options.owners;
	}

	/**
	 * Validate data of config File
	 * @param options - Config file
	 */
	validate(options)
	{
		if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

		if (!options.token) throw new Error('You must pass the token for the client.');
		this.token = options.token;

		if (!options.prefix) throw new Error('You must pass a prefix for the client.');
		if (typeof options.prefix !== 'string') throw new TypeError('Prefix should be a type of String.');
		this.prefix = options.prefix;

		if (options.delete_time && typeof options.delete_time !== 'number') throw new TypeError('Delete_time should be a type of Integer.');
		this.delete_time = (!options.delete_time) ? 5000 : options.delete_time;
	}

	/**
	 * Load Command, Event and Start bot
	 * @param token - Default token of config file
	 * @returns {Promise<void>}
	 */
	async start(token = this.token)
	{
		this.utils.loadCommand();
		this.utils.loadEvents();
		super.login(token);
	}
};