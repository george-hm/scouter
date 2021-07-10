const Command = require('./Command.js');
const Test = require('./Test.js');

const mapping = {
    testing: Test,
};

module.exports.getCommand = (commandData, user) => {
    const commandName = commandData.name;
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
