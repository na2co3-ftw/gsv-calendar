import NumberFormat, {formatNumber} from "./number-format";

interface CalendarConfig {
	name: string;
	units: UnitConfig[];
	adds?: AddConfig[];
	week: WeekConfig;
}

interface UnitConfig extends NumberFormat {
	name: string;
	count: number | null;
	start: number;
}

type AddConfig = (number | null | AddConfig.Mod | AddConfig.Add)[];

namespace AddConfig {
	export interface Mod {
		mod: number;
	}

	export interface Add {
		add: number;
	}

	export function isMod(a: any): a is AddConfig.Mod {
		return a != null && a.hasOwnProperty("mod");
	}

	export function isAdd(a: any): a is AddConfig.Add {
		return a != null && a.hasOwnProperty("add");
	}
}

export type WeekConfig =
	WeekConfig.ModOfDay | WeekConfig.Cycle | WeekConfig.Unit | WeekConfig.Custom | null;

export namespace WeekConfig {
	export interface ModOfDay extends NumberFormat {
		modOfDay: number;
		start: number;
	}

	export interface Cycle extends NumberFormat {
		cycle: number;
		offset: number;
		start: number;
	}

	export interface Unit {
		unit: true;
		max: number;
	}

	export interface Custom extends NumberFormat {
		custom: (date: number[], days: number | null) => number;
		start: number;
		max: number;
	}

	export function isModOfDay(a: any): a is ModOfDay {
		return a != null && a.hasOwnProperty("modOfDay");
	}

	export function isCycle(a: any): a is Cycle {
		return a != null && a.hasOwnProperty("cycle");
	}

	export function isUnit(a: any): a is Unit {
		return a != null && a.unit == true;
	}

	export function isCustom(a: any): a is Custom {
		return a != null && a.hasOwnProperty("custom");
	}
}

export default class Calendar {
	public readonly name: string;
	private readonly units: UnitConfig[];
	private readonly unitsDays: number[];
	private readonly adds: AddConfig[];
	public readonly week: WeekConfig;

	public readonly unitNum: number;
	public readonly unitsName: string[];

	private readonly leapCycleY: number;
	private readonly leapCycleDays: number;
	private readonly leaps: {
		modY: number,
		add: number,
		pos: number,
	}[];
	private readonly leapYToDaysTable: number[];
	private readonly daysToDateTable: { days: number, date: number[] }[];

	constructor(config: CalendarConfig) {
		this.name = config.name;

		if (config.units.length < 2) throw "!";
		if (config.units[0].count != null) throw "!";
		if (config.units.some((unit, i) => i != 0 && unit.count == null)) throw "!";
		if (config.units[0].start != 0) throw "!";
		if (config.units.some((unit, i) => i != 0 && unit.start != 1)) throw "!";
		this.units = config.units;
		this.unitNum = this.units.length;
		this.unitsName = this.units.map(unit => unit.name);

		this.unitsDays = [];
		let d = 1;
		for (let i = this.unitNum - 1; i >= 0; i--) {
			this.unitsDays[i] = d;
			if (i == 0) {
				break;
			}
			d *= this.units[i].count!!;
		}

		this.adds = config.adds || [];
		this.week = config.week;

		this.leapCycleY = 1;
		for (const add of this.adds) {
			if (add.length != this.unitNum) throw "!";
			if (add.slice(1, -1).some(m => typeof m != "number")) throw "!";

			const addD = add[add.length - 1];
			if (!AddConfig.isAdd(addD)) throw "!";

			const y = add[0];
			if (y != null) {
				if (AddConfig.isMod(y)) {
					this.leapCycleY = lcm(this.leapCycleY, y.mod);
				} else {
					throw "!";
				}
			} else {
				this.unitsDays[0] += addD.add;
			}
		}

		this.daysToDateTable = [];
		let dates: number[][] = [[0]];
		for (let unit = 1; unit < this.unitNum - 1; unit++) {
			let newDates: number[][] = [];
			for (let i = 0; i < dates.length; i++) {
				for (let c = this.units[unit].start; c <= this.units[unit].count!; c++) {
					newDates.push([...dates[i], c]);
				}
			}
			dates = newDates;
		}
		for (let i = 0; i < dates.length; i++) {
			const date = [...dates[i], this.units[this.unitNum - 1].start];
			this.daysToDateTable.push({
				days: this.dateToDaysInY(date, true),
				date
			});
		}

		this.leaps = [];
		for (const add of this.adds) {
			const addD = add[add.length - 1];
			if (!AddConfig.isAdd(addD)) throw "!";

			const y = add[0];
			if (AddConfig.isMod(y)) {
				const normalMaxDay = this.maxDayAt(add.slice() as number[], true);
				const pos = this.dateToDaysInY([0, ...add.slice(1, -1) as number[], this.units[this.unitNum - 1].start], true);
				this.leaps.push({
					modY: y.mod,
					add: addD.add,
					pos: Math.min(pos, pos + addD.add)
				});
			}
		}
		this.leaps.sort((a, b) => a.pos - b.pos);

		this.leapCycleDays = this.leapCycleY * this.unitsDays[0];
		for (const {modY, add} of this.leaps) {
			this.leapCycleDays += this.leapCycleY / modY * add;
		}

		this.leapYToDaysTable = [];
		for (let i = 0; i < this.leapCycleY; i++) {
			this.leapYToDaysTable[i] = this.leapYToDays(i);
		}
	}

	dateToDays(date: number[]): number {
		if (date.length != this.unitNum) throw "!";
		let days = 0;
		days += this.leapYToDays(date[0] - this.units[0].start);
		days += this.dateToDaysInY(date, false);
		return days;
	}

	private leapYToDays(y: number): number {
		let days = 0;
		days += y * this.unitsDays[0];
		for (const {modY, add} of this.leaps) {
			days += Math.ceil(y / modY) * add;
		}
		return days;
	}

	private dateToDaysInY(date: number[], ignoreY: boolean): number {
		let days = 0;

		for (let i = 1; i < this.unitNum; i++) {
			days += (date[i] - this.units[i].start) * this.unitsDays[i];
		}

		for (const add of this.adds) {
			const y = add[0];
			if (AddConfig.isMod(y)) {
				if (ignoreY || date[0] % y.mod != 0) {
					continue;
				}
			}
			for (let i = 1; i < this.unitNum - 1; i++) {
				if (date[i] > add[i]!) {
					days += (add[add.length - 1] as AddConfig.Add).add;
					break;
				}
				if (date[i] < add[i]!) {
					break;
				}
			}
		}

		return days;
	}

	private maxDayAt(date: number[], ignoreY: boolean): number {
		let maxD = this.units[this.unitNum - 1].count!!;
		for (const add of this.adds) {
			const y = add[0];
			if (AddConfig.isMod(y)) {
				if (ignoreY || date[0] % y.mod != 0) {
					continue;
				}
			}
			if (add.slice(1, -1).every((m, i) => date[i + 1] == m)) {
				maxD += (add[add.length - 1] as AddConfig.Add).add;
			}
		}
		return maxD;
	}

	getRangeOfUnit(num: number, date: number[]): {start: number, end: number} | null {
		if (date.length != this.unitNum) {
			throw "!";
		}
		if (num >= this.unitNum || num < 0) {
			throw "!";
		}
		if (num == 0) {
			return null;
		}
		if (num < this.unitNum - 1) {
			return {
				start: this.units[num].start,
				end: this.units[num].count! + this.units[num].start - 1,
			};
		}
		return {
			start: this.units[num].start,
			end: this.maxDayAt(date, false)
		};
	}

	isValidDate(date: number[]): { all: boolean, units: boolean[] } {
		if (date.length != this.unitNum) throw "!";
		let valid = true;
		let unitsValid: boolean[] = [];

		for (let i = 0; i < this.unitNum - 1; i++) {
			if (Number.isNaN(date[i])) {
				unitsValid[i] = false;
			} else if (i != 0) {
				unitsValid[i] = this.units[i].start <= date[i] && date[i] <= this.units[i].count!!;
			} else {
				unitsValid[i] = true;
			}
			if (!unitsValid[i]) {
				valid = false;
			}
		}

		let maxD = this.maxDayAt(date, false);
		const d = date[date.length - 1];
		const dValid = !Number.isNaN(d) && this.units[this.unitNum - 1].start <= d && d <= maxD;
		if (!dValid) {
			valid = false;
		}
		unitsValid[this.unitNum - 1] = dValid;

		return {
			all: valid,
			units: unitsValid,
		};
	}

	daysToDate(days: number): number[] {
		const leapCycle = Math.floor(days / this.leapCycleDays);
		days -= leapCycle * this.leapCycleDays;
		let y = 0;
		for (; y < this.leapCycleY; y++) {
			if (this.leapYToDaysTable[y] > days) {
				break;
			}
		}
		y--;

		const daysInY = days - this.leapYToDaysTable[y];
		let normalizedDaysInY = daysInY;
		for (const {modY, add, pos} of this.leaps) {
			if (y % modY != 0) {
				continue;
			}
			if (normalizedDaysInY > pos) {
				if (add > 0 && normalizedDaysInY <= pos + add) {
					normalizedDaysInY = pos;
				} else {
					normalizedDaysInY -= add;
				}
			} else if (normalizedDaysInY < pos) {
				break;
			}
		}

		let i = 0;
		for (; i < this.daysToDateTable.length; i++) {
			if (this.daysToDateTable[i].days > normalizedDaysInY) {
				break;
			}
		}

		let date = this.daysToDateTable[i - 1].date.slice();
		date[0] = y + leapCycle * this.leapCycleY + this.units[0].start;
		date[this.unitNum - 1] += daysInY - this.dateToDaysInY([...date, this.units[this.unitNum - 1].start], false);
		return date;
	}

	getDayOfWeek(date: number[], days: number | null = null): number | null {
		if (date.length != this.unitNum) {
			throw "!";
		}
		if (WeekConfig.isCycle(this.week)) {
			let day = (days || this.dateToDays(date)) + this.week.offset;
			day -= Math.floor(day / this.week.cycle) * this.week.cycle;
			return day + this.week.start;
		}
		if (WeekConfig.isCustom(this.week)) {
			return this.week.custom(date, days);
		}
		if (WeekConfig.isModOfDay(this.week)) {
			return (date[this.unitNum - 1] - this.units[this.unitNum - 1].start) % this.week.modOfDay
				+ this.week.start;
		}
		return null;
	}

	getEpochDate(): number[] {
		return this.units.map(unit => unit.start);
	}

	formatDateUnit(unit: number, value: number): string {
		if (unit >= this.unitNum) throw "!";
		return formatNumber(this.units[unit], value);
	}

	// Returns not null if this.getDayOfWeek() returns not null
	formatDayOfWeek(dayOfWeek: number): string | null {
		if (
			WeekConfig.isCycle(this.week) ||
			WeekConfig.isCustom(this.week) ||
			WeekConfig.isModOfDay(this.week)
		) {
			return formatNumber(this.week, dayOfWeek);
		}
		return null;
	}
}

function gcd(a: number, b: number): number {
	while (a) {
		[a, b] = [b % a, a];
	}
	return b;
}

function lcm(a: number, b: number): number {
	return a * b / gcd(a, b);
}
