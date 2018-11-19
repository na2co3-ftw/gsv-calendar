import Calendar from "../calendar";
import React from "react";

interface CalendarUnitTableProps {
	calendar: Calendar;
	unit: number;
	value: number;
	onClick?: (unit: number, value: number) => void;
}

export default class CalendarUnitTable extends React.PureComponent<CalendarUnitTableProps> {
	private onClickCell(value: number): () => void {
		return () => {
			if (this.props.onClick) {
				this.props.onClick(this.props.unit, value);
			}
		};
	}

	private renderCell(key: number, value: number): React.ReactNode {
		let text = this.props.calendar.formatDateUnit(this.props.unit, value) +
			this.props.calendar.unitsName[this.props.unit];

		if (value == this.props.value) {
			return <td className="selected" key={key} onClick={this.onClickCell(value)}>{text}</td>;
		}
		return <td key={key} onClick={this.onClickCell(value)}>{text}</td>;
	}

	render() {
		const calendar = this.props.calendar;

		const dummyDate: number[] = [];
		dummyDate.length = this.props.calendar.unitNum;
		const range = calendar.getRangeOfUnit(this.props.unit, dummyDate)!;

		let cells: React.ReactNode[] = [];

		for (let value = range.start; value <= range.end; value++) {
			cells.push(this.renderCell(value, value));
		}

		return (<table className="calendar">
			<tbody>
			<tr>{cells}</tr>
			</tbody>
		</table>);
	}
}
