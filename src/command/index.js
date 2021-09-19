const Command = require('./Command.js');
const HourlyCheckIn = require('./HourlyCheckIn.js');
const DailyCheckIn = require('./DailyCheckIn.js');
const Summon = require('./Summon.js');
const Test = require('./Test.js');
const Inventory = require('./Inventory.js');
const Stats = require('./Stats.js');
const Banner = require('./Banner.js');
const Recycle = require('./Recycle.js');

const mapping = {
    [Test.commandName]: Test,
    [Summon.commandName]: Summon,
    [HourlyCheckIn.commandName]: HourlyCheckIn,
    [DailyCheckIn.commandName]: DailyCheckIn,
    [Inventory.commandName]: Inventory,
    [Stats.commandName]: Stats,
    [Banner.commandName]: Banner,
    [Recycle.commandName]: Recycle,
};

module.exports.getCommand = (commandName, customId, options, user, values) => {
    if (!commandName && !customId) {
        throw new Error('Missing commandName and customId');
    }

    if (!commandName) {
        // eslint-disable-next-line no-param-reassign
        commandName = customId.split('.').shift();
    }

    const mappedCommand = mapping[commandName];
    if (!mappedCommand || typeof mappedCommand !== 'function') {
        return null;
    }

    const commandInstance = new mappedCommand(
        commandName,
        customId,
        options,
        user,
        values,
    );
    if (!(commandInstance instanceof Command)) {
        throw new Error('Command is not instanceof command');
    }

    return commandInstance;
};

module.exports.mapping = mapping;
