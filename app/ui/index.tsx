import React from "react";
import ReactDOM from "react-dom";
import {gaalunCalendarClock, sinteeaCalendarClock} from "../settings";
import CalendarClockComponent from "./calendar-clock-component";

document.addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<App/>, document.getElementById("container"));
});

const gaalunSecondByEarthSecond = 4.7956278515625;
const sinteeaSecondByEarthSecond = 1.23819931;
const sinteeaGaalunDifference =
	gaalunCalendarClock.dateTimeToSeconds([3379, 5, 2, 5], [2, 2, 8, 10]) * gaalunSecondByEarthSecond
	- sinteeaCalendarClock.dateTimeToSeconds([1623, 2, 1], [4, 10, 70]) * sinteeaSecondByEarthSecond;

interface AppState {
	sinteeaDate: number[],
	sinteeaTime: number[],
	gaalunDate: number[],
	gaalunTime: number[],
}

function sinteeaToGaalun(date: number[], time: number[]): {date: number[], time: number[]} {
	const s = sinteeaCalendarClock.dateTimeToSeconds(date, time) * sinteeaSecondByEarthSecond;
	const gaalunSeconds = Math.floor((s + sinteeaGaalunDifference) / gaalunSecondByEarthSecond + 0.5);
	return gaalunCalendarClock.secondsToDateTime(gaalunSeconds);
}

function gaalunToSinteea(date: number[], time: number[]): {date: number[], time: number[]} {
	const s = gaalunCalendarClock.dateTimeToSeconds(date, time) * gaalunSecondByEarthSecond;
	const sinteeaSeconds = Math.floor((s - sinteeaGaalunDifference) / sinteeaSecondByEarthSecond + 0.5);
	return sinteeaCalendarClock.secondsToDateTime(sinteeaSeconds);
}

class App extends React.PureComponent<any, AppState> {
	constructor(props: any) {
		super(props);

		const sinteeaDate = sinteeaCalendarClock.calendar.getEpochDate();
		const sinteeaTime = sinteeaCalendarClock.clock.getStartTime();
		const {date: gaalunDate, time: gaalunTime} = sinteeaToGaalun(sinteeaDate, sinteeaTime);

		this.state = {
			sinteeaDate, sinteeaTime,
			gaalunDate, gaalunTime
		};

		this.onChangeSinteeaDate = this.onChangeSinteeaDate.bind(this);
		this.onChangeSinteeaTime = this.onChangeSinteeaTime.bind(this);
		this.onChangeGaalunDate = this.onChangeGaalunDate.bind(this);
		this.onChangeGaalunTime = this.onChangeGaalunTime.bind(this);
	}

	onChangeSinteeaDate(sinteeaDate: number[]) {
		if (!sinteeaCalendarClock.calendar.isValidDate(sinteeaDate).all) {
			this.setState({sinteeaDate});
			return;
		}

		this.setState(state => {
			const {date: gaalunDate, time: gaalunTime} = sinteeaToGaalun(sinteeaDate, state.sinteeaTime);
			return {sinteeaDate, gaalunDate, gaalunTime};
		});
	}

	onChangeSinteeaTime(sinteeaTime: number[]) {
		if (!sinteeaCalendarClock.clock.isValidTime(sinteeaTime).all) {
			this.setState({sinteeaTime});
			return;
		}

		this.setState(state => {
			const {date: gaalunDate, time: gaalunTime} = sinteeaToGaalun(state.sinteeaDate, sinteeaTime);
			return {sinteeaTime, gaalunDate, gaalunTime};
		});
	}

	onChangeGaalunDate(gaalunDate: number[]) {
		if (!gaalunCalendarClock.calendar.isValidDate(gaalunDate).all) {
			this.setState({gaalunDate});
			return;
		}

		this.setState(state => {
			const {date: sinteeaDate, time: sinteeaTime} = gaalunToSinteea(gaalunDate, state.gaalunTime);
			return {gaalunDate, sinteeaDate, sinteeaTime};
		});
	}

	onChangeGaalunTime(gaalunTime: number[]) {
		if (!gaalunCalendarClock.clock.isValidTime(gaalunTime).all) {
			this.setState({gaalunTime});
			return;
		}

		this.setState(state => {
			const {date: sinteeaDate, time: sinteeaTime} = gaalunToSinteea(state.gaalunDate, gaalunTime);
			return {gaalunTime, sinteeaDate, sinteeaTime};
		});
	}

	render() {
		return (<div>
			<CalendarClockComponent
				calendarClock={sinteeaCalendarClock}
				date={this.state.sinteeaDate}
				time={this.state.sinteeaTime}
				onChangeDate={this.onChangeSinteeaDate}
				onChangeTime={this.onChangeSinteeaTime}
			/>
			<hr/>
			<CalendarClockComponent
				calendarClock={gaalunCalendarClock}
				date={this.state.gaalunDate}
				time={this.state.gaalunTime}
				onChangeDate={this.onChangeGaalunDate}
				onChangeTime={this.onChangeGaalunTime}
			/>
		</div>);
	}
}
