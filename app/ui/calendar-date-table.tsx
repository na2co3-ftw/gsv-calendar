import Calendar, {WeekConfig} from "../calendar";
import React from "react";

interface CalendarDateTableProps {
	calendar: Calendar;
	date: number[];
	onClick?: (date: number[]) => void;
}

export default class CalendarDateTable extends React.PureComponent<CalendarDateTableProps> {
	private onClickCell(date: number[]): () => void {
		return () => {
			if (this.props.onClick) {
				this.props.onClick(date);
			}
		};
	}

	private renderCell(key: number, date: number[]): React.ReactNode {
		const day = date[this.props.calendar.unitNum - 1];
		for (let i = 0; i < this.props.calendar.unitNum; i++) {
			if (date[i] != this.props.date[i]) {
				return <td key={key} onClick={this.onClickCell(date)}>{day}</td>;
			}
		}
		return <td className="selected" key={key} onClick={this.onClickCell(date)}>{day}</td>;
	}

	private renderEmptyCell(key: number): React.ReactNode {
		return <td className="empty" key={key}/>;
	}

	render() {
		const calendar = this.props.calendar;
		const date = this.props.date;

		const dayRange = calendar.getUnitRange(calendar.unitNum - 1, date)!;

		let calendarRows: React.ReactNode[] = [];
		if (calendar.isContinuousDayOfWeek) {
			const dayOfWeekRange = calendar.getDayOfWeekRange()!;
			const firstDate = [...date.slice(0, -1), dayRange.start];
			const firstDayOfWeek = calendar.getDayOfWeek(firstDate)! - dayOfWeekRange.start;

			let calendarCells: React.ReactNode[] = [];
			let week = 0;
			let dayOfWeek = dayOfWeekRange.start;
			for (; dayOfWeek < firstDayOfWeek; dayOfWeek++) {
				calendarCells.push(this.renderEmptyCell(dayOfWeek));
			}
			for (let day = dayRange.start; day <= dayRange.end; day++) {
				calendarCells.push(this.renderCell(dayOfWeek, [...date.slice(0, -1), day]));
				if (dayOfWeek == dayOfWeekRange.end) {
					calendarRows.push(<tr key={week}>{calendarCells}</tr>);
					calendarCells = [];
					dayOfWeek = dayOfWeekRange.start;
					week++;
				} else {
					dayOfWeek++;
				}
			}
			if (calendarCells.length > 0) {
				for (; dayOfWeek <= dayOfWeekRange.end; dayOfWeek++) {
					calendarCells.push(this.renderEmptyCell(dayOfWeek));
				}
				calendarRows.push(<tr key={week}>{calendarCells}</tr>);
			}
		} else if (calendar.hasDayOfWeek) {
			const dayOfWeekRange = calendar.getDayOfWeekRange()!;
			let curDate = [...date];
			let prevDayOfWeek = dayOfWeekRange.start - 1;
			let calendarCells: React.ReactNode[] = [];
			let week = 0;
			for (let day = dayRange.start; day <= dayRange.end; day++) {
				curDate[calendar.unitNum - 1] = day;
				const dayOfWeek = calendar.getDayOfWeek(curDate)!;

				if (prevDayOfWeek >= dayOfWeek) {
					for (let d = prevDayOfWeek + 1; d <= dayOfWeekRange.end; d++) {
						calendarCells.push(this.renderEmptyCell(d));
					}
					calendarRows.push(<tr key={week}>{calendarCells}</tr>);
					calendarCells = [];
					week++;
					prevDayOfWeek = dayOfWeekRange.start - 1;
				}
				prevDayOfWeek++;
				while (prevDayOfWeek < dayOfWeek) {
					calendarCells.push(this.renderEmptyCell(prevDayOfWeek));
					prevDayOfWeek++;
				}

				calendarCells.push(this.renderCell(dayOfWeek, [...curDate]));
			}
			if (calendarCells.length > 0) {
				for (let d = prevDayOfWeek + 1; d <= dayOfWeekRange.end; d++) {
					calendarCells.push(this.renderEmptyCell(d));
				}
				calendarRows.push(<tr key={week}>{calendarCells}</tr>);
			}
		} else if (calendar.representConfig.weekUnit) {
			const weekUnit = calendar.unitNum - 2;
			const weekRange = calendar.getUnitRange(weekUnit, date)!;
			const maxDayOfWeek = calendar.representConfig.weekUnit.max;
			const dateFragment = date.slice(0, -2);
			for (let week = weekRange.start; week <= weekRange.end; week++) {
				const dayRange = calendar.getUnitRange(calendar.unitNum - 1, [...dateFragment, week, 0])!;
				let calendarCells: React.ReactNode[] = [];
				calendarCells.push(<th key={-1}>{calendar.formatUnit(weekUnit, week) + calendar.unitsName[weekUnit]}</th>);

				for (let day = dayRange.start; day <= maxDayOfWeek; day++) {
					if (day <= dayRange.end) {
						calendarCells.push(this.renderCell(day, [...dateFragment, week, day]));
					} else {
						calendarCells.push(this.renderEmptyCell(day));
					}
				}
				calendarRows.push(<tr key={week}>{calendarCells}</tr>);
			}
		} else {
			let calendarCells: React.ReactNode[] = [];
			let row = 0;
			let column = 0;
			for (let day = dayRange.start; day <= dayRange.end; day++) {
				calendarCells.push(this.renderCell(column, [...date.slice(0, -1), day]));
				column++;
				if (column == 10) {
					calendarRows.push(<tr key={row}>{calendarCells}</tr>);
					calendarCells = [];
					column = 0;
					row++;
				}
			}

			if (calendarCells.length > 0) {
				if (row > 0) {
					for (; column < 10; column++) {
						calendarCells.push(this.renderEmptyCell(column));
					}
				}
				calendarRows.push(<tr key={row}>{calendarCells}</tr>);
			}
		}

		return (<table className="calendar">
			<tbody>
			{calendarRows}
			</tbody>
		</table>);
	}
}
