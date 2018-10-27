import { load } from './MachineManager';
import { normalizePaytable } from './MachineManager';
import { stripsToReels } from './MachineManager';
import MachineManager from './MachineManager';

describe('MachineManager', () => {

    it('normalizePaytable', () => {
        const i = {
            a: [0, 5, 10],
            b: [0, 2, 4],
            f: [0, 0, 20],
        };
        const o = {
            aa: 5,
            aaa: 10,
            bb: 2,
            bbb: 4,
            fff: 20
        };

        const result = normalizePaytable(i);
        expect(result).toEqual(o);
    });

    it('stripsToReels', () => {
        const strips = {
            a: [2, 1, 1],
            b: [2, 1, 1],
            c: [1, 2, 1],
            f: [1, 1, 1],
            S: [0, 1, 1],
            W: [0, 0, 1]
        };
        const o = stripsToReels(strips);
        expect(o).toEqual(['aabbcf', 'abccfS', 'abcfSW']);
    });

    it('load', () => {
        const config = load('config/mock.yaml');

        // don't perform full verification
        // but just signity check
        expect(config).toBeDefined();
        expect(config.id).toEqual('mock');
        expect(config.version).toEqual(1);
        expect(config.lines).toBeDefined();
        expect(config.reels).toBeDefined();
        expect(config.paytable).toBeDefined();
        expect(config.multipliers).toBeDefined();
        expect(config.minigames).toBeDefined();
    });

    it('getMachine', () => {
        const m = new MachineManager();
        expect(m.getMachine('invalid')).toBeUndefined();
        expect(m.getMachine('mock')).toBeDefined();
    });
});