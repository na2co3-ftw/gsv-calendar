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


const gsvClockTranslator = new ClockTranslator([
	{clock: sinteeaClock, factor: 1.23819931, reference: earthClock},
	{clock: gaalunClock, factor: 4.7956278515625, reference: earthClock},
	{clock: lapeaClock, factor: 73458.81 / 76800, reference: earthClock}
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
	]
], gsvClockTranslator);

export const gsvTimeSystems = [
	sinteeaSystem,
	gaalunSystem,
	gregorianSystem,
	lapeaSystem
];
