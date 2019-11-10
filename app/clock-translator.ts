import Clock from "./clock";

// 1s of clock = factor * 1s of reference
interface ClockTranslatorConfig {
	clock: Clock;
	factor: number;
	reference: Clock;
}

export class ClockTranslator {
	private clocks: Set<Clock> = new Set();
	private table: Map<Clock, Map<Clock, number>> = new Map();

	constructor(config: ClockTranslatorConfig[]) {
		let allClocks = new Set<Clock>();
		for (const c of config) {
			allClocks.add(c.clock);
			allClocks.add(c.reference);
		}

		if (config.length == 0) return;
		this.clocks.add(config[0].clock);

		let restConfig: ClockTranslatorConfig[];
		while (config.length != 0) {
			restConfig = [];
			let added = false;
			for (const c of config) {
				if (this.clocks.has(c.reference)) {
					if (this.clocks.has(c.clock))
						throw "!";
					this.addClock(c.clock, c.factor, 1 / c.factor, c.reference);
				} else if (this.clocks.has(c.clock)) {
					this.addClock(c.reference, 1 / c.factor, c.factor, c.clock);
				} else {
					restConfig.push(c);
					continue;
				}
				added = true;
			}
			if (!added) break;
			config = restConfig;
		}

		if (this.clocks.size != allClocks.size)
			throw "!";
	}

	private addClock(clock: Clock, factor: number, invFactor: number, reference: Clock) {
		for (const otherClock of this.clocks) {
			if (otherClock == reference) {
				this.setTableItem(clock, reference, factor);
				this.setTableItem(reference, clock, invFactor);
			} else {
				this.setTableItem(clock, otherClock, factor * this.table.get(reference)!.get(otherClock)!);
				this.setTableItem(otherClock, clock, this.table.get(otherClock)!.get(reference)! * invFactor);
			}
		}
		this.clocks.add(clock);
	}

	private setTableItem(from: Clock, to: Clock, value: number) {
		let t = this.table.get(from);
		if (typeof t == "undefined") {
			t = new Map();
			this.table.set(from, t);
		}
		t.set(to, value);
	}

	getFactor(from: Clock, to: Clock): number | undefined {
		if (from == to) {
			return 1;
		}

		const t = this.table.get(from);
		if (typeof t != "undefined") {
			return t.get(to);
		}
		return undefined;
	}
}
