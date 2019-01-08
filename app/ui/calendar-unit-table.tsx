import Calendar from "../calendar";
import React from "react";

interface CalendarUnitTableProps {
	calendar: Calendar;
	unit: number;
	date: number[];
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
		let text = this.props.calendar.formatUnit(this.props.unit, value) +
			this.props.calendar.unitsName[this.props.unit];

		if (value == this.props.date[this.props.unit]) {
			return <td className="selected" key={key} onClick={this.onClickCell(value)}>{text}</td>;
		}
		return <td key={key} onClick={this.onClickCell(value)}>{text}</td>;
	}

	render() {
		const calendar = this.props.calendar;

		const range = calendar.getUnitRange(this.props.unit, this.props.date)!;

		let cells: React.ReactNode[] = [];
		for (let value = range.start; value <= range.end; value++) {
			if (calendar.representConfig.hasEmptyUnit) {
				const date = [...this.props.date];
				date[this.props.unit] = value;
				const subRange = calendar.getUnitRange(this.props.unit + 1, date)!;
				if (subRange.end < subRange.start) {
					continue;
				}
			}
			cells.push(this.renderCell(value, value));
		}

		return (<table className="calendar">
			<tbody>
			<tr>{cells}</tr>
			</tbody>
		</table>);
	}
}
