
export function memoize<Args extends unknown[], R>(
	func: (...args: Args) => R,
	resolver: (...args: Args) => unknown
): (...args: Args) => R {
	const cache = new Map<unknown, R>();
	return function(...args: Args): R {
		const key = resolver(...args);
		const cachedValue = cache.get(key);
		if (typeof cachedValue != "undefined") {
			return cachedValue;
		}
		const value = func(...args);
		cache.set(key, value);
		return value;
	};
}
