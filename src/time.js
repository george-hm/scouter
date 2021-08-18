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
        return this._formatTime((lastCheckIn + timeChunk) - timeNow);
    }

    static _withinTime(timeToCheck, timeChunk) {
        const time = constants.getTime();
        if (timeToCheck === 0) {
            return true;
        }

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

    static _pad0(value) {
        return `00${value}`.slice(-2);
    }

    /**
     * Converts a timestamp into a readable format e.g.
     * 1629267333 -> 18857d06h15m33s
     *
     * @returns {string}
     */
    static _formatTime(time) {
        let timestamp = time;
        let start = '';
        if (timestamp < 0) {
            timestamp = -timestamp;
            start = '-';
        }
        if (timestamp === 0) {
            return '0s';
        }
        let secs = timestamp % 60;
        timestamp = Math.floor(timestamp / 60);
        let mins = timestamp % 60;
        timestamp = Math.floor(timestamp / 60);
        let hours = timestamp % 24;
        timestamp = Math.floor(timestamp / 24);
        const days = timestamp;

        let timeString = '';

        // make sure we pad the ones before it but not the first
        if (days) {
            hours = this._pad0(hours);
            mins = this._pad0(mins);
            secs = this._pad0(secs);
        } else if (hours) {
            mins = this._pad0(mins);
            secs = this._pad0(secs);
        } else if (mins) {
            secs = this._pad0(secs);
        } else if (!timestamp) {
            timestamp = '0';
        }

        if (!secs) {
            secs = this._pad0(0);
        }
        if (days) {
            timeString += `${days}d`;
        }
        if (hours) {
            timeString += `${hours}h`;
        }
        if (mins) {
            timeString += `${mins}m`;
        }
        if (secs) {
            timeString += `${secs}s`;
        }

        timeString = start + timeString;

        return timeString;
    }
}

module.exports = CheckIn;
