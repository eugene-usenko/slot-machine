import {
    getCycle,
    StopsGenerator
} from './Simulator';

describe('Simulator', () => {

    it('getCycle', () => {
        const reels = [
            'aaa',  // 3
            'bbbb', // 4
            'ccccc' // 5
        ];
        expect(getCycle(reels)).toBe(3 * 4 * 5);
    });

    it('StopsGenerator', () => {
        const limits = [3, 3, 3];
        const gen = new StopsGenerator(limits);
        const result = [];
        const expected = [
            [0, 0, 0],
            [1, 0, 0],
            [2, 0, 0],
            [0, 1, 0],
            [1, 1, 0],
            [2, 1, 0],
            [0, 2, 0],
            [1, 2, 0],
            [2, 2, 0],
            [0, 0, 1],
            [1, 0, 1],
            [2, 0, 1],
            [0, 1, 1],
            [1, 1, 1],
            [2, 1, 1],
            [0, 2, 1],
            [1, 2, 1],
            [2, 2, 1],
            [0, 0, 2],
            [1, 0, 2],
            [2, 0, 2],
            [0, 1, 2],
            [1, 1, 2],
            [2, 1, 2],
            [0, 2, 2],
            [1, 2, 2],
            [2, 2, 2]];

        while (true) {
            const it = gen.next();
            result.push(it.value);
            if (it.done) break;
        }
        expect(result).toEqual(expected);
    });
});