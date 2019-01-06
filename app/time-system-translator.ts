import TimeSystem from "./time-system";
import {ClockTranslator} from "./clock-translator";

interface TimeSystemDateTime {
	system: TimeSystem;
	date: number[];
	time: number[];
}

export class TimeSystemTranslator {
	private systems: Set<TimeSystem> = new Set();
	private table: Map<TimeSystem, Map<TimeSystem, number>> = new Map();

	constructor(config: TimeSystemDateTime[][], private clockTranslator: ClockTranslator) {
		let allSystems = new Set<TimeSystem>();
		for (const rule of config) {
			if (rule.length < 2) throw "!";
			for (const c of rule) {
				allSystems.add(c.system);
			}
		}

		if (config.length == 0) return;
		this.systems.add(config[0][0].system);

		let restConfig: TimeSystemDateTime[][];
		while (config.length != 0) {
			restConfig = [];
			let added = false;
			for (const rule of config) {
				let reference: TimeSystemDateTime | null = null;
				for (const c of rule) {
					if (this.systems.has(c.system)) {
						reference = c;
						break;
					}
				}
				if (reference == null) {
					restConfig.push(rule);
					continue;
				}
				const refOffset = reference.system.dateTimeToSeconds(reference.date, reference.time);

				for (const c of rule) {
					if (c == reference) continue;
					if (this.systems.has(c.system))
						throw "!";
					const offset = c.system.dateTimeToSeconds(c.date, c.time);
					this.addSystem(c.system, offset, reference.system, refOffset);
				}
				added = true;
			}
			if (!added) break;
			config = restConfig;
		}

		if (this.systems.size != allSystems.size)
			throw "!";
	}

	private addSystem(system: TimeSystem, offset: number, reference: TimeSystem, refOffset: number) {
		for (const otherSystem of this.systems) {
			const intercept = -offset * this.getFactor(system, reference) + refOffset;
			const invIntercept = -refOffset * this.getFactor(reference, system) + offset;
			if (otherSystem == reference) {
				this.setTableItem(system, reference, intercept);
				this.setTableItem(reference, system, invIntercept);
			} else {
				this.setTableItem(system, otherSystem,
					intercept * this.getFactor(reference, otherSystem) + this.table.get(reference)!.get(otherSystem)!);
				this.setTableItem(otherSystem, system,
					this.table.get(otherSystem)!.get(reference)! * this.getFactor(reference, system) + invIntercept);
			}
		}
		this.systems.add(system);
	}

	private setTableItem(from: TimeSystem, to: TimeSystem, value: number) {
		let t = this.table.get(from);
		if (typeof t == "undefined") {
			t = new Map();
			this.table.set(from, t);
		}
		t.set(to, value);
	}

	private getFactor(system: TimeSystem, reference: TimeSystem): number {
		const factor = this.clockTranslator.getFactor(system.clock, reference.clock);
		if (typeof factor == "undefined") throw "!";
		return factor;
	}

	getIntercept(from: TimeSystem, to: TimeSystem): number | undefined {
		if (from == to) {
			return 1;
		}

		const t = this.table.get(from);
		if (typeof t != "undefined") {
			return t.get(to);
		}
		return undefined;
	}

	translate(date: number[], time: number[], from: TimeSystem, to: TimeSystem): {date: number[], time: number[]} {
		const s = this.translateSeconds(from.dateTimeToSeconds(date, time), from, to);
		return to.secondsToDateTime(s);
	}

	translateSeconds(seconds: number, from: TimeSystem, to: TimeSystem): number {
		let s = seconds * this.getFactor(from, to);

		const intercept = this.getIntercept(from, to);
		if (intercept == null) throw "!";
		return Math.floor(s + intercept + 0.5);
	}
}
