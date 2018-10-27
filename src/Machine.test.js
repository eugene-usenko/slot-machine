import { Machine, matches } from './Machine';
import { load } from './MachineManager';

describe('Machine', () => {

    it('getMatchedLength', () => {
        expect(matches('aaa', 'aaa')).toBeTruthy();
        expect(matches('aaa', '*aa')).toBeTruthy();
        expect(matches('aaa', 'a*a')).toBeTruthy();
        expect(matches('aaa', 'aa*')).toBeTruthy();
        expect(matches('aaa', 'a**')).toBeTruthy();
        expect(matches('aaa', '**a')).toBeTruthy();
        expect(matches('aaa', '*a*')).toBeTruthy();
        expect(matches('aaa', '***')).toBeTruthy();

        expect(matches('baa', '*aa')).toBeTruthy();
        expect(matches('aba', 'a*a')).toBeTruthy();
        expect(matches('aab', 'aa*')).toBeTruthy();

        expect(matches('bba', '**a')).toBeTruthy();
        expect(matches('abb', 'a**')).toBeTruthy();

        expect(matches('aax', 'aa')).toBeTruthy();
        expect(matches('xax', '*a')).toBeTruthy();
        expect(matches('axx', 'a*')).toBeTruthy();

        expect(matches('aSS', '*SS')).toBeTruthy();
        expect(matches('aSW', '*SS')).toBeFalsy();
    });

    it('sanitize', () => {
        const c = load('config/mock.yaml');
        const m = new Machine(c);

        const s = m.sanitize();
        expect(s).not.toBe(m);

        expect(s.version).toBeUndefined();
        expect(s.multipliers).toBeUndefined();
        expect(s.minigames).toBeUndefined();
        expect(s.expected).toBeUndefined();
        expect(s.strips).toBeUndefined();

        expect(s.id).toBe(m.id);
        expect(s.name).toBe(m.name);
        expect(s.lines).toBe(m.lines);
        expect(s.reels).toBeDefined();
        expect(s.paytable).toBe(m.paytable);
    });

    it('toHits', () => {
        const reels = [
            'abcd',
            'abcd',
            'abcd'
        ];
        const m = new Machine({ reels });

        expect(m.toHits([0, 0, 0], [0, 0, 0])).toEqual('aaa');
        expect(m.toHits([0, 0, 0], [1, 1, 1])).toEqual('bbb');
        expect(m.toHits([0, 0, 0], [2, 2, 2])).toEqual('ccc');

        expect(m.toHits([0, 1, 2], [0, 0, 0])).toEqual('abc');
        expect(m.toHits([2, 1, 0], [1, 1, 1])).toEqual('dcb');
        // corner case: offset exceeds reel length
        expect(m.toHits([3, 3, 3], [1, 2, 3])).toEqual('abc');
        expect(m.toHits([2, 2, 2], [1, 2, 3])).toEqual('dab');
    });

    it('getPays', () => {
        const paytable = {
            aa: 5,
            aaa: 10,
            b: 1,
            bb: 2,
            bbb: 4
        };
        const m = new Machine({ paytable });

        // pure line(no special symbols)
        expect(m.getPays('aaa')).toBe(10);
        expect(m.getPays('aax')).toBe(5);
        expect(m.getPays('axx')).toBe(0);
        expect(m.getPays('bbb')).toBe(4);
        expect(m.getPays('bbx')).toBe(2);
        expect(m.getPays('bxx')).toBe(1);

        // one special symbol on the line
        expect(m.getPays('aaW')).toBe(10);
        expect(m.getPays('Waa')).toBe(10);
        expect(m.getPays('aWa')).toBe(10);

        expect(m.getPays('aWx')).toBe(5);
        expect(m.getPays('Wax')).toBe(5);

        // two special symbols on the line
        expect(m.getPays('WWa')).toBe(10);
        expect(m.getPays('WaW')).toBe(10);
        expect(m.getPays('aWW')).toBe(10);

        // two different special symbols on the line
        expect(m.getPays('aSW')).toBe(10);
        expect(m.getPays('aWS')).toBe(10);
        expect(m.getPays('WaS')).toBe(10);
        expect(m.getPays('WSa')).toBe(10);
        expect(m.getPays('aSW')).toBe(10);
        expect(m.getPays('aWS')).toBe(10);

        expect(m.getPays('')).toBe(0);
        expect(m.getPays('a')).toBe(0);
        expect(m.getPays('x')).toBe(0);
        expect(m.getPays('xx')).toBe(0);
    });

    it('getMultiplier', () => {
        const multipliers = {
            'www': 7,
            'w**w': 6,
            'w*w': 5,
            '*ww': 4,
            '**w': 3,
            '*w': 2
        };
        const m = new Machine({ multipliers });

        // 3 'w' symbols from the begining as win combination, line is 3 symbols length
        expect(m.getMultiplier('wwwx')).toBe(7);
        // 2 'w' symbols complete the line on the start/end, line is 4 symbols length
        expect(m.getMultiplier('wxxw')).toBe(6);
        // the same as prev. but with trailing symbol, line is 4 symbols length
        expect(m.getMultiplier('wxwa')).toBe(5);
        // 2 'w' symbols complete line which starts with 'a', line is 3 symbols length
        expect(m.getMultiplier('awwx')).toBe(4);
        // 1 'w' symbol completes line which starts with two 'a', line is 3 symbols length
        expect(m.getMultiplier('aawx')).toBe(3);
        // 1 'w' symbols completes line which starts with 'a', line is 2 symbols length
        expect(m.getMultiplier('awxx')).toBe(2);

        expect(m.getMultiplier('')).toBe(1);
        expect(m.getMultiplier('x')).toBe(1);
        expect(m.getMultiplier('w')).toBe(1);
        expect(m.getMultiplier('xx')).toBe(1);
        expect(m.getMultiplier('ab')).toBe(1);
        expect(m.getMultiplier('abx')).toBe(1);
    });

    it('getMinigame', () => {
        const minigames = {
            'ss*': 'a',
            's*s': 'b',
            '*ss': 'c'
        };
        const m = new Machine({ minigames });

        expect(m.getMinigame('ssx')).toBe('a');
        expect(m.getMinigame('sxs')).toBe('b');
        expect(m.getMinigame('xss')).toBe('c');

        expect(m.getMinigame('')).toBeUndefined();
        expect(m.getMinigame('a')).toBeUndefined();
        expect(m.getMinigame('aa')).toBeUndefined();
        expect(m.getMinigame('abc')).toBeUndefined();
    });

    // it('getRows', () => {
    //     const m = new Machine({});
    //     expect(m.getRows([])).toEqual([0]);
    //     expect(m.getRows([[0, 1, 2]])).toEqual([0, 1, 2]);
    //     expect(m.getRows([
    //         [0, 0, 0],
    //         [2, 1, 0],
    //         [0, 1, 4]
    //     ])).toEqual([0, 1, 2, 3, 4]);
    // });

    // it('getReels', () => {
    //     const rows = [0, 1, 2];
    //     const reels = [
    //         'abcd',
    //         'abcd',
    //         'abcd'
    //     ];
    //     const m = new Machine({ reels });
    //     expect(m.getReels(rows, [0, 0, 0])).toEqual(['abc', 'abc', 'abc']);
    //     expect(m.getReels(rows, [1, 1, 1])).toEqual(['bcd', 'bcd', 'bcd']);
    //     expect(m.getReels(rows, [3, 3, 3])).toEqual(['dab', 'dab', 'dab']);
    //     expect(m.getReels(rows, [3, 0, 3])).toEqual(['dab', 'abc', 'dab']);
    //     expect(m.getReels(rows, [0, 3, 0])).toEqual(['abc', 'dab', 'abc']);
    //     expect(m.getReels(rows, [1, 2, 3])).toEqual(['bcd', 'cda', 'dab']);
    // });
});