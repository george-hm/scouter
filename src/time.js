const constants = require('./constants.js');

const hour = 3600;
const day = hour * 24;

class CheckIn {
    static eligableForDaily(lastCheckIn) {
        return this._withinTime(lastCheckIn, day);
    }

    static eligableForHourly(lastCheckIn) {
        return this._withinTime(lastCheckIn, day);
    }

    static timeUntilHourly(lastCheckIn) {
        return this._timeUntil(lastCheckIn, hour);
    }

    static _timeUntil(lastCheckIn, timeChunk) {
        const timeNow = constants.getTime();
        return (lastCheckIn + timeChunk) - timeNow;
    }

    static _withinTime(timeToCheck, timeChunk) {
        const time = constants.getTime();
        if (time - timeToCheck > timeChunk) {
            return true;
        }

        return false;
    }

    static get dailyReward() {
        return 20;
    }

    static get hourlyReward() {
        return 5;
    }
}

module.exports = CheckIn;
