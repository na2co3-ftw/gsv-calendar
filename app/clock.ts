
interface UnitConfig {
	name: string;
	count: number;
	start?: number;
}

export default class Clock {
	public readonly unitNum: number;
	public readonly secondsOfDay: number;

	constructor(public readonly units: UnitConfig[]) {
		this.unitNum = units.length;
		if (this.unitNum < 1) throw "!";

		let seconds = 1;
		for (const unit of units) {
			seconds *= unit.count;
		}
		this.secondsOfDay = seconds;
	}

	timeToSeconds(time: number[]): number {
		if (time.length != this.unitNum) throw "!";

		let seconds = 0;
		for (let i = 0; i < this.unitNum; i++) {
			if (i != 0) {
				seconds *= this.units[i].count;
			}

			if (this.units[i].start) {
				seconds += time[i] - this.units[i].start!;
			} else {
				seconds += time[i];
			}
		}
		return seconds;
	}

	secondsToTime(seconds: number): number[] {
		if (seconds < 0) throw "!";
		let time = [];

		let restTime = seconds;
		for (let i = this.unitNum - 1; i >= 0; i--) {
			time[i] = restTime % this.units[i].count;
			if (this.units[i].start) {
				time[i] += this.units[i].start!;
			}
			restTime = Math.floor(restTime / this.units[i].count);
		}

		if (restTime != 0) throw "!";
		return time;
	}

	isValidTime(time: number[]): { all: boolean, units: boolean[] } {
		if (time.length != this.unitNum) throw "!";
		let valid = true;
		let unitsValid = [];

		for (let i = 0; i < this.unitNum; i++) {
			if (Number.isNaN(time[i])) {
				unitsValid[i] = false;
			} else if (this.units[i].start) {
				unitsValid[i] = (this.units[i].start!) <= time[i] && time[i] < this.units[i].count + this.units[i].start!;
			} else {
				unitsValid[i] = 0 <= time[i] && time[i] < this.units[i].count;
			}
			if (!unitsValid[i]) {
				valid = false;
			}
		}

		return {
			all: valid,
			units: unitsValid,
		};
	}

	getStartTime(): number[] {
		return this.units.map(unit => unit.start || 0);
	}
}
