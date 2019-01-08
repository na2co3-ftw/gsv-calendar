import isEqual from "lodash.isequal";
import NumberFormat, {formatNumber} from "./number-format";

/*
 * Unit: year, month, day, and other components of the calendar
 * Middle unit: unit excluding year and day
 */

interface CalendarConfig {
	name: string;
	year: string;
	middleUnits: UnitConfig[];
	day: DayUnitConfig;
	week?: WeekConfig;
	represent?: CalendarRepresentConfig;
}

interface UnitConfig extends NumberFormat {
	name: string;
	count: number;
	start: number;
}

interface DayUnitConfig {
	name: string;
	count: number;
	start: number;
	modify?: DayUnitModify[]
}

interface DayUnitModify {
	yearMod?: number;
	matchMiddle: number[];
	count?: number;
	start?: number;
}

export type WeekConfig =
	WeekConfig.ModOfDay | WeekConfig.Cycle | WeekConfig.Custom;

export namespace WeekConfig {
	export interface ModOfDay extends NumberFormat {
		name: string;
		modOfDay: number;
		start: number;
	}

	export interface Cycle extends NumberFormat {
		name: string;
		cycle: number;
		offset: number;
		start: number;
	}

	export interface Custom extends NumberFormat {
		name: string;
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

	export function isCustom(a: any): a is Custom {
		return a != null && a.hasOwnProperty("custom");
	}
}

interface CalendarRepresentConfig {
	weekUnit?: {max: number},
	hasEmptyUnit?: boolean
}


interface UnitInfo {
	periods: UnitInfoPeriod[];
	days: number;
}

interface UnitInfoPeriod {
	offsetDays: number;
	subPeriods?: UnitInfoPeriod[];
}

export default class Calendar {
	public readonly name: string;
	public readonly unitNum: number;
	public readonly unitsName: string[];
	public readonly hasDayOfWeek: boolean = false;
	public readonly dayOfWeekName: string | null = null;
	public readonly isContinuousDayOfWeek: boolean = false;
	public readonly representConfig: CalendarRepresentConfig;

	private middleUnits: UnitConfig[];
	private dayUnit: DayUnitConfig;
	private hasModifiedDayUnitStart: boolean = false;
	private week: WeekConfig | undefined;

	private yearMods: number[] = [];
	private leapCycleYears: number;
	private leapCycleDays: number;
	private yearInCycleOffsetDays: number[] = [];

	private unitInfoByLeapIndex: Map<number, UnitInfo> = new Map();

	constructor(config: CalendarConfig) {
		this.name = config.name;
		this.middleUnits = config.middleUnits;
		this.dayUnit = config.day;
		this.week = config.week;
		this.representConfig = config.represent || {};

		this.unitNum = config.middleUnits.length + 2;
		this.unitsName = [config.year, ...config.middleUnits.map(u => u.name), config.day.name];
		if (WeekConfig.isModOfDay(config.week) || WeekConfig.isCycle(config.week)) {
			this.hasDayOfWeek = true;
			this.dayOfWeekName = config.week.name;
			this.isContinuousDayOfWeek = true;
		} else if (WeekConfig.isCustom(config.week)) {
			this.hasDayOfWeek = true;
			this.dayOfWeekName = config.week.name;
		}

		if (config.middleUnits.length == 0) throw "!";

		this.leapCycleYears = 1;
		if (config.day.modify) {
			for (const mod of config.day.modify) {
				if (typeof mod.start != "undefined") {
					this.hasModifiedDayUnitStart = true;
				}
				if (typeof mod.yearMod == "undefined") continue;
				this.yearMods.push(mod.yearMod);
				this.leapCycleYears = lcm(this.leapCycleYears, mod.yearMod);
			}
		}

		let offsetDays = 0;
		for (let yearInCycle = 0; yearInCycle < this.leapCycleYears; yearInCycle++) {
			this.yearInCycleOffsetDays[yearInCycle] = offsetDays;

			const leapIndex = this.getLeapIndex(yearInCycle);
			let unitInfo = this.unitInfoByLeapIndex.get(leapIndex);
			if (typeof unitInfo == "undefined") {
				unitInfo = this.generateUnitInfo(0, [], yearInCycle);
				this.unitInfoByLeapIndex.set(leapIndex, unitInfo);
			}
			offsetDays += unitInfo.days;
		}
		this.leapCycleDays = offsetDays;
	}

	private generateUnitInfo(i: number, middle: number[], year: number): UnitInfo {
		let periods: UnitInfoPeriod[] = [];
		let days = 0;
		for (let val = 0; val < this.middleUnits[i].count; val++) {
			let deltaDays;
			let subPeriods;
			if (i + 1 < this.middleUnits.length) {
				const subInfo = this.generateUnitInfo(i + 1, [...middle, val + this.middleUnits[i].start], year);
				subPeriods = subInfo.periods;
				deltaDays = subInfo.days;
			} else {
				deltaDays = this.getModifiedDayUnit([year, ...middle, val + this.middleUnits[i].start]).count;
			}
			periods[val] = {
				offsetDays: days,
				subPeriods
			};
			days += deltaDays;
		}
		return {periods, days};
	}

	private getModifiedDayUnit(date: number[]): {count: number, start: number} {
		let count = this.dayUnit.count;
		let start = this.dayUnit.start;
		if (this.dayUnit.modify) {
			const year = date[0];
			const middle = date.slice(1, this.middleUnits.length + 1);
			for (const mod of this.dayUnit.modify) {
				if (typeof mod.yearMod != "undefined") {
					if (year % mod.yearMod != 0) continue;
				}
				if (isEqual(mod.matchMiddle, middle)) {
					if (typeof mod.count != "undefined") {
						count = mod.count;
					}
					if (typeof mod.start != "undefined") {
						start = mod.start;
					}
				}
			}
		}
		return {count, start};
	}

	private getLeapIndex(year: number): number {
		let leapIndex = 1;
		for (const mod of this.yearMods) {
			if (year % mod == 0) {
				leapIndex = lcm(leapIndex, mod);
			}
		}
		return leapIndex;
	}

	dateToDays(date: number[]): number {
		if (date.length != this.unitNum) throw "!";

		const cycle = Math.floor(date[0] / this.leapCycleYears);
		const yearInCycle = date[0] - cycle * this.leapCycleYears;

		let days = cycle * this.leapCycleDays;
		days += this.yearInCycleOffsetDays[yearInCycle];

		const leapIndex = this.getLeapIndex(yearInCycle);
		let periods = this.unitInfoByLeapIndex.get(leapIndex)!.periods;
		for (let i = 0; i < this.middleUnits.length; i++) {
			const val = date[i + 1] - this.middleUnits[i].start;
			days += periods[val].offsetDays;
			periods = periods[val].subPeriods!;
		}

		const dayUnit = this.hasModifiedDayUnitStart ? this.getModifiedDayUnit(date) : this.dayUnit;
		days += date[this.unitNum - 1] - dayUnit.start;
		return days;
	}

	daysToDate(days: number): number[] {
		let date: number[] = [];
		const cycle = Math.floor(days / this.leapCycleDays);
		date[0] = cycle * this.leapCycleYears;
		days -= cycle * this.leapCycleDays;

		let yearInCycle = 0;
		for (; yearInCycle < this.leapCycleYears; yearInCycle++) {
			if (this.yearInCycleOffsetDays[yearInCycle] > days) {
				break;
			}
		}
		yearInCycle--;
		date[0] += yearInCycle;
		days -= this.yearInCycleOffsetDays[yearInCycle];

		const leapIndex = this.getLeapIndex(yearInCycle);
		let periods = this.unitInfoByLeapIndex.get(leapIndex)!.periods;
		for (let i = 0; i < this.middleUnits.length; i++) {
			let val = 1;
			for (; val < periods.length; val++) {
				if (periods[val].offsetDays > days) {
					break;
				}
			}
			val--;
			date[i + 1] = val + this.middleUnits[i].start;
			days -= periods[val].offsetDays;
			periods = periods[val].subPeriods!;
		}

		const dayUnit = this.hasModifiedDayUnitStart ? this.getModifiedDayUnit(date) : this.dayUnit;
		date[this.unitNum - 1] = days + dayUnit.start;
		return date;
	}

	isValidDate(date: number[]): { all: boolean, units: boolean[] } {
		if (date.length != this.unitNum) throw "!";
		let valid = true;
		let unitsValid: boolean[] = [];

		if (Number.isNaN(date[0])) {
			unitsValid[0] = false;
			valid = false;
		}

		for (let i = 0; i < this.middleUnits.length; i++) {
			const val = date[i + 1] - this.middleUnits[i].start;
			if (Number.isNaN(val) || val < 0 || this.middleUnits[i].count <= val) {
				unitsValid[i] = false;
				valid = false;
			}
		}

		const dayUnitNum = this.unitNum - 1;
		const dayUnit = this.getModifiedDayUnit(date);
		const day = date[dayUnitNum] - dayUnit.start;
		if (Number.isNaN(day) || day < 0 || dayUnit.count <= day) {
			unitsValid[dayUnitNum] = false;
			valid = false;
		}

		return {
			all: valid,
			units: unitsValid,
		};
	}

	getUnitRange(unit: number, date: number[]): {start: number, end: number} | null {
		if (date.length != this.unitNum)  throw "!";
		if (unit >= this.unitNum) throw "!";
		if (unit == 0) {
			return null;
		}
		if (unit - 1 < this.middleUnits.length) {
			const unitConfig = this.middleUnits[unit - 1];
			return {
				start: unitConfig.start,
				end: unitConfig.count + unitConfig.start - 1,
			};
		}

		const dayUnit = this.getModifiedDayUnit(date);
		return {
			start: dayUnit.start,
			end: dayUnit.count + dayUnit.start - 1
		};
	}

	formatUnit(unit: number, value: number): string {
		if (unit >= this.unitNum) throw "!";
		if (unit == 0) {
			return value.toString();
		}
		if (unit - 1 < this.middleUnits.length) {
			return formatNumber(this.middleUnits[unit - 1], value);
		}
		return value.toString();
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
			const dayUnit = this.hasModifiedDayUnitStart ? this.getModifiedDayUnit(date) : this.dayUnit;
			return (date[this.unitNum - 1] - dayUnit.start) % this.week.modOfDay
				+ this.week.start;
		}
		return null;
	}

	// Returns not null if this.getDayOfWeek() returns not null
	getDayOfWeekRange(): {start: number, end: number} | null {
		if (WeekConfig.isCycle(this.week)) {
			return {
				start: this.week.start,
				end: this.week.cycle + this.week.start - 1
			};
		}
		if (WeekConfig.isCustom(this.week)) {
			return {
				start: this.week.start,
				end: this.week.max
			};
		}
		if (WeekConfig.isModOfDay(this.week)) {
			return {
				start: this.week.start,
				end: this.week.modOfDay + this.week.start - 1
			};
		}
		return null;
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
