import Calendar from "./calendar";
import Clock from "./clock";
import CalendarClock from "./calendar-clock";
import {ClockTranslator} from "./clock-translator";
import {CalendarClockTranslator} from "./calendar-clock-translator";

const sinteeaCalendar = new Calendar({
	name: "シンテーア暦",
	units: [
		{name: "年", count: null, start: 0},
		{name: "月", count: 16, start: 1},
		{name: "日", count: 21, start: 1}
	],
	adds: [
		[{mod: 6}, 6, {add: 1}],
		[null, 8, {add: 1}],
		[null, 16, {add: 1}]
	],
	week: {
		custom: (date: number[]) => {
			const m = date[1];
			const d = date[2];
			if (d == 22) {
				return 7;
			}
			return (((m - 1) % 2) * 21 + d - 1) % 6 + 1;
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

const sinteeaCalendarClock = new CalendarClock(sinteeaCalendar, sinteeaClock);


const gaalunCalendar = new Calendar({
	name: "ガールン暦",
	units: [
		{name: "年", count: null, start: 0},
		{name: "月", count: 8, start: 1,
			customFormat: ["上1", "上2", "上3", "上4", "下1", "下2", "下3", "下4"]
		},
		{name: "週", count: 4, start: 1},
		{name: "日", count: 8, start: 1}
	],
	adds: [
		[null, 1, 4, {add: -1}],
		[null, 2, 2, {add: -1}],
		[null, 3, 3, {add: -1}],
		[null, 4, 4, {add: -1}],
		[{mod: 5}, 4, 4, {add: 1}],
		[null, 5, 1, {add: -1}],
		[null, 5, 4, {add: -1}],
		[null, 6, 2, {add: -1}],
		[null, 6, 4, {add: -1}],
		[{mod: 86}, 6, 4, {add: 1}]
	],
	week: {
		unit: true,
		max: 8
	}
});

const gaalunClock = new Clock([
	{name: "途", count: 4, start: 1},
	{name: "時", count: 4, start: 1},
	{name: "分", count: 16, start: 1},
	{name: "秒", count: 64, start: 1},
]);

const gaalunCalendarClock = new CalendarClock(gaalunCalendar,gaalunClock);


const gregorioCalendar = new Calendar({
	name: "グレゴリオ暦",
	units: [
		{name: "年", count: null, start: 0},
		{name: "月", count: 12, start: 1},
		{name: "日", count: 31, start: 1}
	],
	adds: [
		[null, 2, {add: -3}],
		[{mod: 4}, 2, {add: 1}],
		[{mod: 100}, 2, {add: -1}],
		[{mod: 400}, 2, {add: 1}],
		[null, 4, {add: -1}],
		[null, 6, {add: -1}],
		[null, 9, {add: -1}],
		[null, 11, {add: -1}]
	],
	week: {
		cycle: 7,
		offset: 6,
		start: 0,
		customFormat: ["日", "月", "火", "水", "木", "金", "土"]
	}
});

const gregorioClock = new Clock([
	{name: "時", count: 24},
	{name: "分", count: 60},
	{name: "秒", count: 60},
]);

const gregorioCalendarClock = new CalendarClock(gregorioCalendar, gregorioClock);


export const gsvClockTranslator = new ClockTranslator([
	{clock: sinteeaClock, factor: 1.23819931, reference: gregorioClock},
	{clock: gaalunClock, factor: 4.7956278515625, reference: gregorioClock}
]);

export const gsvTranslator = new CalendarClockTranslator([
	[
		{calendar: sinteeaCalendarClock, date: [1623, 2, 1], time: [4, 10, 70]},
		{calendar: gaalunCalendarClock, date: [3379, 5, 2, 5], time: [2, 2, 8, 10]}
	], [
		{calendar: sinteeaCalendarClock, date: [1738, 12, 9], time: [11, 49, 11]},
		{calendar: gregorioCalendarClock, date: [2157, 12, 16], time: [9, 0, 0]}
	]
], gsvClockTranslator);

export const gsvCalendarClocks = [
	sinteeaCalendarClock,
	gaalunCalendarClock,
	gregorioCalendarClock
];
