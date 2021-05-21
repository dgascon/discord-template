const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const Command = require('./Command.js');
const Event = require('./Event.js');
const fs = require('fs')

/**
 * Function util for the bot
 * @type {Util}
 */
module.exports = class Util {
	constructor(client) {
		this.client = client;
	}

	/**
	 * Check if input is a Class
	 * @param input is a file
	 * @returns {boolean} true if input is a class else false
	 */
	isClass(input) {
		return typeof input === 'function'
			&& typeof input.prototype === 'object'
			&& input.toString().substring(0, 5) === 'class';
	}

	/**
	 * Reture absolute path
	 * @returns {string}
	 */
	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}

	removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	/**
	 * Return the string with the first letter to uppercase
	 * @param string
	 * @returns {string}
	 */
	capitalise(string) {
		return string.split(' ').map(str => str.slice(0, 1).toUpperCase() + str.slice(1)).join(' ');
	}

	/**
	 * Loads the commands contained in the "Commands" folder
	 * @returns {Promise<void>}
	 */
	async loadCommand() {
		return glob(`${this.directory}commands/**/*.js`).then(commands => {
			for (const commandFile of commands)
			{
				delete require.cache[commandFile];
				const { name } = path.parse(commandFile);
				const File = require(commandFile);
				if (!this.isClass(File)) throw new TypeError(`Command ${name} doesn't export a class.`);
				const command = new File(this.client, name.toLowerCase());
				if (!(command instanceof Command)) throw new TypeError(`Command ${name} doesn't belong in commands.`);
				this.client.commands.set(command.name, command);
				if (command.aliases.length)
				{
					for (const alias of command.aliases) {
						this.client.aliases.set(alias, command.name);
					}
				}
			}
		});
	}

	/**
	 * Lods the commands contained in the "Events" folder
	 * @returns {Promise<void>}
	 */
	async loadEvents()
	{
		return glob(`${this.directory}events/**/*.js`).then(events => {
			for (const eventFile of events)
			{
				delete require.cache[eventFile];
				const { name } = path.parse(eventFile);
				const File = require(eventFile);
				if (!this.isClass(File)) throw new TypeError(`Event ${name} doesn't export a class!`);
				const event = new File(this.client, name.toLowerCase());
				if (!(event instanceof  Event)) throw new TypeError(`Event ${name} doesn't belong in events.`);
				this.client.events.set(event.name, event);
				event.emitter[event.type](name, (...args) => event.run(...args));
			}
		})
	}
}