import React from "react";
import ReactDOM from "react-dom";
import {gsvTimeSystems, gsvTranslator} from "../settings";
import TimeSystemComponent from "./time-system-component";

document.addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<App/>, document.getElementById("container"));
});

interface AppState {
	dateTimes: {date: number[], time: number[]}[];
}

class App extends React.PureComponent<any, AppState> {
	constructor(props: any) {
		super(props);

		this.state = {
			dateTimes: this.calculateDateTimes(
				0,
				gsvTimeSystems[0].calendar.getEpochDate(),
				gsvTimeSystems[0].clock.getStartTime()
			)
		};
	}

	private onChangeDate(id: number): (date: number[]) => void {
		return (date: number[]) => {
			if (!gsvTimeSystems[id].calendar.isValidDate(date).all) {
				this.setState(state => {
					const dateTimes = [...state.dateTimes];
					dateTimes[id] = {date, time: dateTimes[id].time};
					return {dateTimes};
				});
				return;
			}

			this.setState(state => ({dateTimes: this.calculateDateTimes(id, date, state.dateTimes[id].time)}));
		};
	}

	private onChangeTime(id: number): (time: number[]) => void {
		return (time: number[]) => {
			if (!gsvTimeSystems[id].clock.isValidTime(time).all) {
				this.setState(state => {
					const dateTimes = [...state.dateTimes];
					dateTimes[id] = {date: dateTimes[id].date, time};
					return {dateTimes};
				});
				return;
			}

			this.setState(state => ({dateTimes: this.calculateDateTimes(id, state.dateTimes[id].date, time)}));
		};
	}

	private calculateDateTimes(id: number, date: number[], time: number[]): {date: number[], time: number[]}[] {
		let dateTimes: {date: number[], time: number[]}[] = [];
		dateTimes[id] = {date, time};
		let seconds = gsvTimeSystems[id].dateTimeToSeconds(date, time);

		for (let i = 0; i < gsvTimeSystems.length; i++) {
			if (i == id) continue;
			const s = gsvTranslator.translateSeconds(seconds, gsvTimeSystems[id], gsvTimeSystems[i]);
			dateTimes[i] = gsvTimeSystems[i].secondsToDateTime(s);
		}
		return dateTimes;
	}

	render() {
		let components: React.ReactNode[] = [];
		for (let i = 0; i < gsvTimeSystems.length; i++) {
			if (i != 0) {
				components.push(<hr key={`${i}hr`}/>);
			}
			components.push(<TimeSystemComponent
				key={i}
				timeSystem={gsvTimeSystems[i]}
				date={this.state.dateTimes[i].date}
				time={this.state.dateTimes[i].time}
				onChangeDate={this.onChangeDate(i)}
				onChangeTime={this.onChangeTime(i)}
			/>);
		}

		return (<div>{components}</div>);
	}
}
