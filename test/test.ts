/// <reference types="node" />
import {describe, it} from "mocha";
import * as assert from "assert";
import Calendar from "../app/calendar";

describe("Calendar", function () {
	function testDateAndDays(calendar: Calendar, date: number[], days: number) {
		it(`${date.join("/")} is ${days} days`, function () {
			assert.strictEqual(calendar.dateToDays(date), days);
		});
		it(`${days} days is ${date.join("/")}`, function () {
			assert.deepStrictEqual(calendar.daysToDate(days), date);
		});
	}

	describe("Simple Calendar", function() {
		const simpleCalendar = new Calendar({
			name: "Simple Calendar",
			year: "year",
			middleUnits: [
				{name: "month", count: 12, start: 1},
				{name: "week", count: 4, start: 1}
			],
			day: {name: "day", count: 7, start: 1}
		});
		testDateAndDays(simpleCalendar, [0, 1, 1, 1], 0);
		testDateAndDays(simpleCalendar, [0, 1, 1, 7], 6);
		testDateAndDays(simpleCalendar, [1, 1, 1, 1], 12*4*7);
		testDateAndDays(simpleCalendar, [1, 2, 3, 4], 12*4*7+4*7+2*7+3);
	});

	describe("Complex Calendar", function() {
		const complexCalendar = new Calendar({
			name: "Complex Calendar",
			year: "year",
			middleUnits: [
				{name: "month", count: 12, start: 1},
				{name: "week", count: 4, start: 1}
			],
			day: {
				name: "day", count: 7, start: 1,
				modify: [
					{matchMiddle: [2, 1], count:9},
					{matchMiddle: [2, 4], count:4},
					{matchMiddle: [4, 2], count:5},
				]
			}
		});
		testDateAndDays(complexCalendar, [0, 2, 1, 1], 4*7);
		testDateAndDays(complexCalendar, [0, 2, 1, 9], 4*7+8);
		testDateAndDays(complexCalendar, [0, 2, 2, 1], 4*7+9);
		testDateAndDays(complexCalendar, [0, 2, 4, 4], 4*7+3*7+2+3);
		testDateAndDays(complexCalendar, [0, 3, 1, 1], 2*4*7-1);
		testDateAndDays(complexCalendar, [0, 4, 3, 1], 3*4*7+2*7-3);
		testDateAndDays(complexCalendar, [1, 1, 1, 1], 12*4*7-3);
	});

	describe("Simple Calendar with Leap Years", function() {
		const leapCalendar = new Calendar({
			name: "Simple Calendar with Leap Years",
			year: "year",
			middleUnits: [
				{name: "month", count: 12, start: 1},
				{name: "week", count: 4, start: 1}
			],
			day: {
				name: "day", count: 7, start: 1,
				modify: [
					{yearMod: 5, matchMiddle: [2, 1], count:9},
					{yearMod: 15, matchMiddle: [2, 1], count:7},
					{yearMod: 7, matchMiddle: [4, 1], count:10},
				]
			}
		});
		testDateAndDays(leapCalendar, [1, 1, 1, 1], 12*4*7+3);
		testDateAndDays(leapCalendar, [5, 1, 1, 1], 5*12*4*7+3);
		testDateAndDays(leapCalendar, [5, 2, 1, 9], 5*12*4*7+4*7+8+3);
		testDateAndDays(leapCalendar, [5, 2, 2, 1], 5*12*4*7+4*7+7+5);
		testDateAndDays(leapCalendar, [6, 1, 1, 1], 6*12*4*7+5);
		testDateAndDays(leapCalendar, [7, 1, 1, 1], 7*12*4*7+5);
		testDateAndDays(leapCalendar, [7, 4, 1, 10], 7*12*4*7+3*4*7+9+5);
		testDateAndDays(leapCalendar, [7, 4, 2, 1], 7*12*4*7+3*4*7+7+8);
		testDateAndDays(leapCalendar, [8, 1, 1, 1], 8*12*4*7+8);
		testDateAndDays(leapCalendar, [10, 1, 1, 1], 10*12*4*7+8);
		testDateAndDays(leapCalendar, [11, 1, 1, 1], 11*12*4*7+10);
		testDateAndDays(leapCalendar, [15, 2, 2, 1], 15*12*4*7+4*7+7+13);
		testDateAndDays(leapCalendar, [16, 1, 1, 1], 16*12*4*7+13);
		testDateAndDays(leapCalendar, [35, 1, 1, 1], 35*12*4*7+23);
		testDateAndDays(leapCalendar, [35, 4, 2, 1], 35*12*4*7+3*4*7+7+28);
		testDateAndDays(leapCalendar, [36, 1, 1, 1], 36*12*4*7+28);
	});
});
