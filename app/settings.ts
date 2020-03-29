import Calendar from "./calendar";
import Clock from "./clock";
import TimeSystem from "./time-system";
import {ClockTranslator} from "./clock-translator";
import {TimeSystemTranslator} from "./time-system-translator";

const sinteeaCalendar = new Calendar({
	year: "年",
	middleUnits: [
		{name: "月", count: 16, start: 1}
	],
	day: {
		name: "日", count: 21, start: 1,
		modify: [
			{yearMod: 6, matchMiddle: [6], count: 22},
			{matchMiddle: [8], count: 22},
			{matchMiddle: [16], count: 22}
		],
	},
	week: {
		name: "曜日",
		custom: (date: number[]) => {
			const m = date[1];
			const d = date[2];
			if (d == 22) {
				return 7;
			}
			return ((m - 1) * 21 + d - 1) % 6 + 1;
		},
		start: 1,
		max: 7,
		customFormat: ["1", "2", "3", "4", "5", "終", "祭"]
	}
});

const sinteeaClock = new Clock([
	{name: "時", count: 20},
	{name: "分", count: 72},
	{name: "秒", count: 72},
]);

const sinteeaSystem = new TimeSystem("シンテーア暦", sinteeaCalendar, sinteeaClock);


const gaalunCalendar = new Calendar({
	year: "年",
	middleUnits: [
		{name: "月", count: 8, start: 1,
			customFormat: ["上1", "上2", "上3", "上4", "下1", "下2", "下3", "下4"]
		},
		{name: "週", count: 4, start: 1}
	],
	day: {
		name: "日", count: 8, start: 1,
		modify: [
			{matchMiddle: [1, 4], count: 7},
			{matchMiddle: [2, 2], count: 7},
			{matchMiddle: [3, 3], count: 7},
			{matchMiddle: [4, 4], count: 7},
			{yearMod: 5, matchMiddle: [4, 4], count: 8},
			{matchMiddle: [5, 1], count: 7},
			{matchMiddle: [5, 4], count: 7},
			{matchMiddle: [6, 2], count: 7},
			{matchMiddle: [6, 4], count: 7},
			{yearMod: 86, matchMiddle: [6, 4], count: 8}
		],
	},
	represent: {
		weekUnit: {max: 8}
	}
});

const gaalunClock = new Clock([
	{name: "途", count: 4, start: 1},
	{name: "時", count: 4, start: 1},
	{name: "分", count: 16, start: 1},
	{name: "秒", count: 64, start: 1},
]);

const gaalunSystem = new TimeSystem("ガールン暦", gaalunCalendar, gaalunClock);


const gregorianCalendar = new Calendar({
	year: "年",
	middleUnits: [
		{name: "月", count: 12, start: 1}
	],
	day: {
		name: "日", count: 31, start: 1,
		modify: [
			{matchMiddle: [2], count: 28},
			{yearMod: 4, matchMiddle: [2], count: 29},
			{yearMod: 100, matchMiddle: [2], count: 28},
			{yearMod: 400, matchMiddle: [2], count: 29},
			{matchMiddle: [4], count: 30},
			{matchMiddle: [6], count: 30},
			{matchMiddle: [9], count: 30},
			{matchMiddle: [11], count: 30}
		],
	},
	week: {
		name: "曜日",
		cycle: 7,
		offset: 6,
		start: 0,
		customFormat: ["日", "月", "火", "水", "木", "金", "土"]
	}
});

const earthClock = new Clock([
	{name: "時", count: 24},
	{name: "分", count: 60},
	{name: "秒", count: 60},
]);

const gregorianSystem = new TimeSystem("グレゴリオ暦", gregorianCalendar, earthClock);


const lapeaCalendar = new Calendar({
	year: "年",
	middleUnits: [
		{name: "月", count: 9, start: 0},
	],
	day: {
		name: "日", count: 33, start: 1,
		modify: [
			{matchMiddle: [0], count: 0, start: 0},
			{yearMod: 100, matchMiddle: [0], count: 1},
			{matchMiddle: [2], count: 34},
			{matchMiddle: [4], count: 34},
			{matchMiddle: [6], count: 34},
			{matchMiddle: [8], count: 34}
		]
	},
	week: {
		name: "曜日",
		cycle: 8,
		offset: 0,
		start: 0,
		customFormat: ["黄", "橙", "緑", "黒", "紫", "青", "赤", "白"]
	},
	represent: {
		hasEmptyUnit: true
	}
});

const lapeaClock = new Clock([
	{name: "時", count: 12},
	{name: "分", count: 100},
	{name: "秒", count: 64},
]);

const lapeaSystem = new TimeSystem("ラペア暦", lapeaCalendar, lapeaClock);


const rofilnaCalendar = new Calendar({
	year: "年",
	middleUnits: [
		{name: "月", count: 12, start: 1}
	],
	day: {
		name: "日", count: 30, start: 1,
		modify: [
			{matchMiddle: [4], count: 28},
			{yearMod: 3, matchMiddle: [4], count: 31},
			{matchMiddle: [7], count: 28},
			{matchMiddle: [12], count: 28},
		],
	}
});

const rofilnaClock = new Clock([
	{name: "時", count: 25},
	{name: "分", count: 80},
	{name: "秒", count: 40},
]);

const rofilnaOldSystem = new TimeSystem("ロフィルナ旧暦", rofilnaCalendar, rofilnaClock);
const rofilnaNewSystem = new TimeSystem("ロフィルナ新暦", rofilnaCalendar, rofilnaClock);

const eoruiszCalendar = new Calendar({
	year: "年",
	middleUnits: [
		{name: "季", count: 4, start: 1}
	],
	day: {
		name: "日", count: 55, start: 1,
		modify: [
			{matchMiddle: [3], count: 56},
			{yearMod: 2, matchMiddle: [1], count: 56},
			{yearMod: 100, yearOffset: 0, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 12, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 24, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 36, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 48, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 60, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 72, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 84, matchMiddle: [2], count: 56},
			{yearMod: 100, yearOffset: 96, matchMiddle: [2], count: 56},
		],
	},
	week: {
		name: "曜日",
		custom: (date: number[]) => {
			const d = date[2];
			if (d == 56) {
				return 12;
			}
			return (d - 1) % 11 + 1;
		},
		start: 1,
		max: 12,
		customFormat: ["日", "火", "石", "金", "海", "地", "雪", "木", "青", "雲", "氷", "暗"]
	}
});

const eoruiszClock = new Clock([
	{name: "時", count: 20},
	{name: "分", count: 100},
	{name: "秒", count: 100}
]);

const eoruiszSystem = new TimeSystem("オーリス暦", eoruiszCalendar, eoruiszClock);


const norfiskeatCalendar = new Calendar({
	year: "年",
	middleUnits: [
		{name: "永", count: 13, start: 1},
	],
	day: {
		name: "日", count: 32, start: 1,
		modify: [
			{yearMod: 5, matchMiddle: [12], count: 33},
			{yearMod: 5, matchMiddle: [13], count: 33},
		],
	},
	week: {
		name: "曜日",
		custom: (date: number[]) => {
			const d = date[2];
			if (d == 33) {
				return date[1] == 12 ? 9 : 10;
			}
			return (d - 1) % 8 + 1;
		},
		start: 1,
		max: 10,
		customFormat: ["風", "花", "雪", "杜", "永", "波", "白", "瑞", "万", "創"]
	}
});

const norfiskeatClock = new Clock([
	{name: "時", count: 26},
	{name: "分", count: 70},
	{name: "秒", count: 50}
]);

const norfiskeatSystem = new TimeSystem("双子暦", norfiskeatCalendar, norfiskeatClock);


const gsvClockTranslator = new ClockTranslator([
	{clock: sinteeaClock, factor: 1.23819931, reference: earthClock},
	{clock: gaalunClock, factor: 4.7956278515625, reference: earthClock},
	{clock: lapeaClock, factor: 73458.81 / 76800, reference: earthClock},
	{clock: rofilnaClock, factor: (31846851 - 0.3592156998724847) / 355 / rofilnaClock.secondsOfDay, reference: earthClock},
	{clock: eoruiszClock, factor: 0.52993266, reference: earthClock},
	{clock: norfiskeatClock, factor: 1.4753, reference: earthClock}
]);

export const gsvTranslator = new TimeSystemTranslator([
	[
		{system: sinteeaSystem, date: [1623, 2, 1], time: [4, 10, 70]},
		{system: gaalunSystem, date: [3379, 5, 2, 5], time: [2, 2, 8, 10]}
	], [
		{system: sinteeaSystem, date: [1738, 12, 9], time: [11, 49, 11]},
		{system: gregorianSystem, date: [2157, 12, 16], time: [9, 0, 0]}
	], [
		{system: sinteeaSystem, date: [1707, 6, 10], time: [11, 31, 26]},
		{system: lapeaSystem, date: [3672, 3, 14], time: [0, 0, 0]},
	], [
		{system: sinteeaSystem, date: [1312, 16, 14], time: [17, 21, 10]},
		{system: rofilnaOldSystem, date: [6175, 4, 28], time: [9, 40, 0]},
		{system: rofilnaNewSystem, date: [1, 4, 28], time: [9, 40, 0]},
	], [
		{system: sinteeaSystem, date: [0, 1, 1], time: [0, 0, 0]},
		{system: eoruiszSystem, date: [1033, 1, 45], time: [6, 13, 4]}
	], [
		{system: sinteeaSystem, date: [1700, 1, 1], time: [0, 0, 0]},
		{system: norfiskeatSystem, date: [2300, 3, 16], time: [0, 64, 0]}
	]
], gsvClockTranslator);

export const gsvTimeSystems = [
	sinteeaSystem,
	gaalunSystem,
	gregorianSystem,
	lapeaSystem,
	rofilnaNewSystem,
	rofilnaOldSystem,
	eoruiszSystem,
	norfiskeatSystem
];
