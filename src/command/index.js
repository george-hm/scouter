const Command = require('./Command.js');
const Test = require('./Test.js');
const TestOptionOne = require('./TestOptionOne.js');

const mapping = {
    testing: Test,
    TestOptionOne,
};

module.exports.getCommand = (commandData, user) => {
    const commandName = Command.getCommandName(commandData);
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
