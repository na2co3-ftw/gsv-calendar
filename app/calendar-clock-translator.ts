import CalendarClock from "./calendar-clock";
import {ClockTranslator} from "./clock-translator";

interface CalendarClockTranslatorConfig {
	calendar: CalendarClock;
	date: number[];
	time: number[];
}

export class CalendarClockTranslator {
	private calendars: Set<CalendarClock> = new Set();
	private table: Map<CalendarClock, Map<CalendarClock, number>> = new Map();

	constructor(config: CalendarClockTranslatorConfig[][], private clockTranslator: ClockTranslator) {
		let allCalendars = new Set<CalendarClock>();
		for (const rule of config) {
			if (rule.length < 2) throw "!";
			for (const c of rule) {
				allCalendars.add(c.calendar);
			}
		}

		if (config.length == 0) return;
		this.calendars.add(config[0][0].calendar);

		let restConfig: CalendarClockTranslatorConfig[][];
		while (config.length != 0) {
			restConfig = [];
			let added = false;
			for (const rule of config) {
				let reference: CalendarClockTranslatorConfig | null = null;
				for (const c of rule) {
					if (this.calendars.has(c.calendar)) {
						reference = c;
						break;
					}
				}
				if (reference == null) {
					restConfig.push(rule);
					continue;
				}
				const refOffset = reference.calendar.dateTimeToSeconds(reference.date, reference.time);

				for (const c of rule) {
					if (c == reference) continue;
					if (this.calendars.has(c.calendar))
						throw "!";
					const offset = c.calendar.dateTimeToSeconds(c.date, c.time);
					this.addCalendar(c.calendar, offset, reference.calendar, refOffset);
				}
				added = true;
			}
			if (!added) break;
			config = restConfig;
		}

		if (this.calendars.size != allCalendars.size)
			throw "!";
	}

	private addCalendar(calendar: CalendarClock, offset: number, reference: CalendarClock, refOffset: number) {
		for (const otherCalendar of this.calendars) {
			const intercept = -offset * this.getFactor(calendar, reference) + refOffset;
			const invIntercept = -refOffset * this.getFactor(reference, calendar) + offset;
			if (otherCalendar == reference) {
				this.setTableItem(calendar, reference, intercept);
				this.setTableItem(reference, calendar, invIntercept);
			} else {
				this.setTableItem(calendar, otherCalendar,
					intercept * this.getFactor(reference, otherCalendar) + this.table.get(reference)!.get(otherCalendar)!);
				this.setTableItem(otherCalendar, calendar,
					this.table.get(otherCalendar)!.get(reference)! * this.getFactor(reference, calendar) + invIntercept);
			}
		}
		this.calendars.add(calendar);
	}

	private setTableItem(from: CalendarClock, to: CalendarClock, value: number) {
		let t = this.table.get(from);
		if (typeof t == "undefined") {
			t = new Map();
			this.table.set(from, t);
		}
		t.set(to, value);
	}

	private getFactor(calendar: CalendarClock, reference: CalendarClock): number {
		const factor = this.clockTranslator.getFactor(calendar.clock, reference.clock);
		if (typeof factor == "undefined") throw "!";
		return factor;
	}

	getIntercept(from: CalendarClock, to: CalendarClock): number | undefined {
		if (from == to) {
			return 1;
		}

		const t = this.table.get(from);
		if (typeof t != "undefined") {
			return t.get(to);
		}
		return undefined;
	}

	translate(date: number[], time: number[], from: CalendarClock, to: CalendarClock): {date: number[], time: number[]} {
		const s = this.translateSeconds(from.dateTimeToSeconds(date, time), from, to);
		return to.secondsToDateTime(s);
	}

	translateSeconds(seconds: number, from: CalendarClock, to: CalendarClock): number {
		let s = seconds * this.getFactor(from, to);

		const intercept = this.getIntercept(from, to);
		if (intercept == null) throw "!";
		return Math.floor(s + intercept + 0.5);
	}
}
