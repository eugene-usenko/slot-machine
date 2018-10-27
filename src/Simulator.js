// @ts-check

/**
 * Creates generator to generate sequance of stop values 
 * for the reals.
 *
 * Example, there are 3 reels with length 10, 15, 25. Input 
 * paterameter for current function will be [10,15, 25] and 
 * generageted sequance:
 *
 * [0,0,0]
 * [1,0,0]
 * ...
 * [0,1,0]
 * ...
 * [9,14,24]
 *
 * @param {Array} limits array where every value 
 * corresponds to reel length.
 */
export function* StopsGenerator(limits) {
    // there are troubles with 'isEqual' from 'lodash' 
    const isEqual = (a, b) =>
        a.join() === b.join();

    const value = limits.map(_ => 0);
    const max = limits.map(l => l - 1);

    const increment = (i = 0) => {
        const threshold = value[i] === max[i];
        value[i] = threshold ? 0 : value[i] + 1;
        if (threshold) increment(i + 1);
    };

    while (!isEqual(value, max)) {
        yield [...value];
        increment();
    }
    return value;
}

export const getCycle = reels =>
    reels.reduce((cycle, reel, index) => {
        return index === 0
            ? reel.length
            : cycle * reel.length;
    }, 1);

export const getPayout = machine => {
    if (!machine) throw new Error('Machine instance must be defined!');

    const { reels } = machine;
    const limits = reels.map(r => r.length);
    // @ts-ignore
    const gen = new StopsGenerator(limits);
    const line = reels.map(_ => 0);
    const cycle = getCycle(reels);
    var won = 0;

    while (true) {
        const { value: stops, done } = gen.next();
        const { outcome } = machine.spin([line], stops);
        const o = outcome[0]; // we passed one line as param

        const pays = o.pays * o.multiplier;
        const minigames = getMinigameExpected(machine, o.minigame);
        won += pays + minigames;

        if (done) break;
    }

    return 100 * won / cycle;
};

/**
 * Creates generator which performs 'spin' action on every iteration with
 * single counter increment. Generator stops, when machine 'reaches' the
 * end of the cycle.
 * 
 * @param {Object} machine instance ofthe machine. 
 * @return {Object} generator instance, which must be used to walk through
 * every combination and get spin outcome.
 */
export const getSimulator = function* (machine) {
    if (!machine) throw new Error('Machine instance must be defined!');

    const limits = machine.reels.map(r => r.length);
    // @ts-ignore
    const gen = new StopsGenerator(limits);
    const line = machine.reels.map(_ => 0);

    while (true) {
        const { value: stops, done } = gen.next();
        const { outcome } = machine.spin([line], stops);
        const o = outcome[0]; // we passed one line as param
        delete o.line;

        var total = o.pays * o.multiplier;
        total += getMinigameExpected(machine, o.minigame);

        const hits = machine.toHits(line, stops);
        const result = { stops, hits, outcome: o, total };

        if (done) return result;
        yield result;
    }
};

export const getMinigameExpected = (machine, id) =>
    machine.expected[id] ? machine.expected[id] : 0;

