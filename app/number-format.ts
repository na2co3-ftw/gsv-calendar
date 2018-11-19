
export default interface NumberFormat {
	start: number;
	customFormat?: string[];
}

export function formatNumber(format: NumberFormat, value: number): string {
	if (format.customFormat) {
		return format.customFormat[value - format.start];
	}
	return value.toString();
}
