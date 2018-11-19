import React, {RefObject} from "react";
import CalendarDateTable from "./calendar-date-table";
import CalendarClock from "../calendar-clock";
import CalendarUnitTable from "./calendar-unit-table";
import {WeekConfig} from "../calendar";

interface CalendarClockComponentProps {
	calendarClock: CalendarClock;
	date: number[];
	time: number[];
	onChangeDate: (date: number[]) => void;
	onChangeTime: (time: number[]) => void;
}

export default class CalendarClockComponent extends React.PureComponent<CalendarClockComponentProps> {
	private timeInputs: RefObject<HTMLInputElement>[] = [];

	constructor(props: CalendarClockComponentProps) {
		super(props);
		for (let i = 0; i < this.props.calendarClock.clock.unitNum; i++) {
			this.timeInputs[i] = React.createRef();
		}

		this.onChangeYearInput = this.onChangeYearInput.bind(this);
		this.onChangeTimeInput = this.onChangeTimeInput.bind(this);
		this.onClickCalendarUnit = this.onClickCalendarUnit.bind(this);
		this.onClickCalendarDay = this.onClickCalendarDay.bind(this);
	}

	private onChangeYearInput(e: React.ChangeEvent<HTMLInputElement>) {
		let date = [...this.props.date];
		date[0] = parseInt(e.target.value, 10);
		this.props.onChangeDate(date);
	}

	private onClickCalendarUnit(unit: number, value: number) {
		let date = [...this.props.date];
		date[unit] = value;
		this.props.onChangeDate(date);
	}

	private onClickCalendarDay(date: number[]) {
		this.props.onChangeDate(date);
	}

	private onChangeTimeInput() {
		let time = [];
		for (let i = 0; i < this.props.calendarClock.clock.unitNum; i++) {
			time[i] = parseInt(this.timeInputs[i].current!.value, 10);
		}
		this.props.onChangeTime(time);
	}

	render() {
		const calendar = this.props.calendarClock.calendar;
		const clock = this.props.calendarClock.clock;

		let dateTimeText = "";
		for (let i = 0; i < calendar.unitNum; i++) {
			dateTimeText += calendar.formatDateUnit(i, this.props.date[i]);
			dateTimeText += calendar.unitsName[i];
			dateTimeText += " ";
		}
		let weekOfDay = calendar.getDayOfWeek(this.props.date);
		if (weekOfDay != null) {
			dateTimeText += `(${calendar.formatDayOfWeek(weekOfDay)}曜日) `;
		}
		for (let i = 0; i < clock.unitNum; i++) {
			dateTimeText += this.props.time[i] + clock.units[i].name;
			dateTimeText += " ";
		}

		let unitTables = [];
		let unitTableEnd = calendar.unitNum - 1;
		if (WeekConfig.isUnit(calendar.week)) {
			unitTableEnd--;
		}
		for (let i = 1; i < unitTableEnd; i++) {
			unitTables.push(<CalendarUnitTable
				calendar={calendar}
				unit={i}
				value={this.props.date[i]}
				onClick={this.onClickCalendarUnit}
				key={i}
			/>);
		}

		let timeIsValid = clock.isValidTime(this.props.time);

		return (<div>
			{calendar.name}: {dateTimeText} <br/>

			<input
				type="number" value={this.props.date[0]}
				onChange={this.onChangeYearInput}
			/>{calendar.unitsName[0]}

			{unitTables}

			<CalendarDateTable
				calendar={calendar}
				date={this.props.date}
				onClick={this.onClickCalendarDay}
			/>

			{clock.units.map((unit, i) => [
				<input
					type="number" value={this.props.time[i]}
					className={timeIsValid.units[i] ? "": "invalid"}
					key={i}
					onChange={this.onChangeTimeInput}
					ref={this.timeInputs[i]}
				/>, unit.name
			])}
		</div>);
	}
}
