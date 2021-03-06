import Calendar from "./calendar";
import Clock from "./clock";

export default class TimeSystem {
	constructor(
		public readonly name: string,
		public readonly calendar: Calendar,
		public readonly clock: Clock
	) {}

	dateTimeToSeconds(date: number[], time: number[]): number {
		return this.calendar.dateToDays(date) * this.clock.secondsOfDay
			+ this.clock.timeToSeconds(time);
	}

	secondsToDateTime(seconds: number): { date: number[], time: number[] } {
		const days = Math.floor(seconds / this.clock.secondsOfDay);
		const secondsInDay = seconds - days * this.clock.secondsOfDay;
		return {
			date: this.calendar.daysToDate(days),
			time: this.clock.secondsToTime(secondsInDay)
		};
	}
}
