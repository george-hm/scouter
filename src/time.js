const { DateTime } = require('luxon');

const hour = 3600;
const day = hour * 24;

class Time {
    static getPrintableTimestamp() {
        const time = this.getTime() * 1000;
        const date = new Date(time);
        const currentDay = this._pad0(date.getDate());
        const currentMonth = this._pad0(date.getMonth() + 1);
        const currentYear = date.getFullYear();

        const hours = this._pad0(date.getHours());
        const minutes = this._pad0(date.getMinutes());
        const seconds = this._pad0(date.getSeconds());

        return `[${currentDay}-${currentMonth}-${currentYear} ${hours}:${minutes}:${seconds}]`;
    }

    static getTime() {
        return Math.floor(Date.now() / 1000);
    }

    static eligableForDaily(lastCheckIn) {
        return this._withinTime(lastCheckIn, day);
    }

    static eligableForHourly(lastCheckIn) {
        return this._withinTime(lastCheckIn, hour);
    }

    static dailyStreakIsValid(streak, lastCheckin) {
        return this._streakIsValid(streak, day, lastCheckin);
    }

    static hourlyStreakIsValid(streak, lastCheckin) {
        return this._streakIsValid(streak, hour, lastCheckin);
    }

    static _streakIsValid(streak, timeframe, lastCheckin) {
        if (!streak) {
            return false;
        }

        const timeNow = this.getTime();
        if (timeNow - lastCheckin > (timeframe * 2)) {
            return false;
        }

        return true;
    }

    static timeUntilHourly(lastCheckIn) {
        return this.timeUntil(lastCheckIn, hour);
    }

    static timeUntilDaily(lastCheckIn) {
        return this.timeUntil(lastCheckIn, day);
    }

    static timeUntil(lastCheckIn, timeChunk) {
        const timeNow = this.getTime();
        return this.formatTime((lastCheckIn + (timeChunk || 0)) - timeNow);
    }

    static _withinTime(timeToCheck, timeChunk) {
        const time = this.getTime();
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
    static formatTime(time) {
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
            timeString += ` ${hours}h`;
        }
        if (mins) {
            timeString += ` ${mins}m`;
        }
        if (secs) {
            timeString += ` ${secs}s`;
        }

        timeString = start + timeString;

        // remove any double spaces and trim
        timeString = timeString.replace(/\s+/g, ' ')
            .trim();

        return timeString;
    }

    // 1 = monday 7 = sunday
    static getUpcomingDayOfWeek(dayOfWeek) {
        if (!dayOfWeek || dayOfWeek > 7) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
        }

        let linstance = DateTime.now().toUTC();
        const currentDay = linstance.weekday;
        let daysToAdd = dayOfWeek - currentDay;
        if (daysToAdd < 0) {
            daysToAdd = 7 + daysToAdd;
        }
        if (daysToAdd === 0) {
            daysToAdd = 7;
        }
        // set the day we want
        linstance = linstance.plus({ days: daysToAdd })
            .set({ hour: 0, minute: 0, seconds: 0 });

        return Math.floor(linstance.toSeconds());
    }
}

module.exports = Time;
