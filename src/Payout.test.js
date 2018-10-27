import { getPayout, getSimulator } from './Simulator';
import { Machine } from './Machine';
import { load } from './MachineManager';

describe('Payout', () => {

    const getMachine = id => {
        const config = load(`config/${id}.yaml`, true);
        return new Machine(config);
    };

    it('mock: 474%', () => {
        const m = getMachine('mock');
        const p = getPayout(m);
        expect(Math.floor(p)).toBe(474);
    });

    it.skip('bug-ab-boom: 60%', () => {
        const m = getMachine('bug-a-boom');
        const p = getPayout(m);
        expect(Math.floor(p)).toBe(60);
    });

    // test('mock', () => {
    //     const m = new MachineManager().getMachine('mock');
    //     const gen = getSimulator(m);
    //     while (true) {
    //         const { value, done } = gen.next();
    //         // console.log(JSON.stringify(value));
    //         if (done) break;
    //     }
    // });
});