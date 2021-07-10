const Command = require('../model/Command.js');
const Test = require('./Test.js');

const mapping = {
    testing: Test,
};

module.exports.getCommand = (commandData, user) => {
    const commandName = commandData.name;
    const mappedCommand = mapping[commandName];
    if (!mappedCommand || !(mappedCommand instanceof Command)) {
        return null;
    }
    return new mapping[commandName](commandData, user);
};
