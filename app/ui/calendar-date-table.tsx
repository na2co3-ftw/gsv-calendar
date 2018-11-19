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

		const dayRange = calendar.getRangeOfUnit(calendar.unitNum - 1, date)!;

		let calendarRows: React.ReactNode[] = [];
		if (WeekConfig.isModOfDay(calendar.week)) {
			let calendarCells: React.ReactNode[] = [];
			let row = 0;
			let column = 0;
			for (let day = dayRange.start; day <= dayRange.end; day++) {
				calendarCells.push(this.renderCell(column, [...date.slice(0, -1), day]));
				column++;
				if (column == calendar.week.modOfDay) {
					calendarRows.push(<tr key={row}>{calendarCells}</tr>);
					calendarCells = [];
					column = 0;
					row++;
				}
			}
			if (calendarCells.length > 0) {
				for (; column < calendar.week.modOfDay; column++) {
					calendarCells.push(this.renderEmptyCell(column));
				}
				calendarRows.push(<tr key={row}>{calendarCells}</tr>);
			}
		} else if (WeekConfig.isCycle(calendar.week)) {
			let firstDate = date.slice();
			firstDate[calendar.unitNum - 1] = dayRange.start;
			const firstDay = calendar.getDayOfWeek(firstDate)! - calendar.week.start;

			let calendarCells: React.ReactNode[] = [];
			let row = 0;
			let column = 0;
			for (; column < firstDay; column++) {
				calendarCells.push(this.renderEmptyCell(column));
			}
			for (let day = dayRange.start; day <= dayRange.end; day++) {
				calendarCells.push(this.renderCell(column, [...date.slice(0, -1), day]));
				column++;
				if (column == calendar.week.cycle) {
					calendarRows.push(<tr key={row}>{calendarCells}</tr>);
					calendarCells = [];
					column = 0;
					row++;
				}
			}
			if (calendarCells.length > 0) {
				for (; column < calendar.week.cycle; column++) {
					calendarCells.push(this.renderEmptyCell(column));
				}
				calendarRows.push(<tr key={row}>{calendarCells}</tr>);
			}
		} else if (WeekConfig.isUnit(calendar.week)) {
			const weekUnit = calendar.unitNum - 2;
			const weekRange = calendar.getRangeOfUnit(weekUnit, date)!;
			const dateFragment = date.slice(0, -2);
			for (let week = weekRange.start; week <= weekRange.end; week++) {
				const dayRange = calendar.getRangeOfUnit(calendar.unitNum - 1, [...dateFragment, week, 0])!;
				let calendarCells: React.ReactNode[] = [];
				calendarCells.push(<th key={-1}>{calendar.formatDateUnit(weekUnit, week) + calendar.unitsName[weekUnit]}</th>);

				for (let day = dayRange.start; day <= calendar.week.max; day++) {
					if (day <= dayRange.end) {
						calendarCells.push(this.renderCell(day, [...dateFragment, week, day]));
					} else {
						calendarCells.push(this.renderEmptyCell(day));
					}
				}
				calendarRows.push(<tr key={week}>{calendarCells}</tr>);
			}
		} else if (WeekConfig.isCustom(calendar.week)) {
			let curDate = date.slice();
			let prevDayOfWeek = calendar.week.start - 1;
			let calendarCells: React.ReactNode[] = [];
			let row = 0;
			for (let day = dayRange.start; day <= dayRange.end; day++) {
				curDate[calendar.unitNum - 1] = day;
				const dayOfWeek = calendar.getDayOfWeek(curDate)!;

				if (prevDayOfWeek >= dayOfWeek) {
					for (let d = prevDayOfWeek + 1; d <= calendar.week.max; d++) {
						calendarCells.push(this.renderEmptyCell(d));
					}
					calendarRows.push(<tr key={row}>{calendarCells}</tr>);
					calendarCells = [];
					row++;
					prevDayOfWeek = calendar.week.start - 1;
				}
				prevDayOfWeek++;
				while (prevDayOfWeek < dayOfWeek) {
					calendarCells.push(this.renderEmptyCell(prevDayOfWeek));
					prevDayOfWeek++;
				}

				calendarCells.push(this.renderCell(dayOfWeek, [...curDate]));
			}
			if (calendarCells.length > 0) {
				for (let d = prevDayOfWeek + 1; d <= calendar.week.max; d++) {
					calendarCells.push(this.renderEmptyCell(d));
				}
				calendarRows.push(<tr key={row}>{calendarCells}</tr>);
			}
		} else {
			let calendarCells: React.ReactNode[] = [];
			for (let day = dayRange.start; day <= dayRange.end; day++) {
				calendarCells.push(this.renderCell(day, [...date.slice(0, -1), day]));
			}
			calendarRows.push(<tr>{calendarCells}</tr>);
		}

		return (<table className="calendar">
			<tbody>
			{calendarRows}
			</tbody>
		</table>);
	}
}
