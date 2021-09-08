const Command = require('./Command.js');
const HourlyCheckIn = require('./HourlyCheckIn.js');
const DailyCheckIn = require('./DailyCheckIn.js');
const Summon = require('./Summon.js');
const Test = require('./Test.js');

const mapping = {
    [Test.commandName]: Test,
    [Summon.commandName]: Summon,
    [HourlyCheckIn.commandName]: HourlyCheckIn,
    [DailyCheckIn.commandName]: DailyCheckIn,
};

module.exports.getCommand = (commandData, user) => {
    const commandName = commandData.commandName;
    const mappedCommand = mapping[commandName];
    if (!mappedCommand || typeof mappedCommand !== 'function') {
        return null;
    }

    const commandInstance = new mappedCommand(commandData, user);
    if (!(commandInstance instanceof Command)) {
        throw new Error('Command is not instanceof command');
    }
    return new mapping[commandName](commandData, user);
};

module.exports.mapping = mapping;
