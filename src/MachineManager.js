import fs from 'fs';
import yaml from 'js-yaml';
import { resolve } from 'path';
import { Machine } from './Machine';

/**
 * Converts paytable config to format which can be consumed
 * and used by the machine. Example:
 * 
 * Input:  { a: [0, 1, 2], b: [0, 2, 4] }
 * Output: { aa: 1, aaa: 2, bb: 2, bbb: 4 }
 * 
 * All 0 combination will be skipped, only combinations which
 * gives real win values will be added to resulting table.
 * 
 * @param {object} table instance of paytable.
 * @returns {object} normalized paytable is represented as a 
 * regular JS object where key is a winning combination and 
 * value win amount.
 */
export const normalizePaytable = table => {
    const rules = (symbol, array) => array
        .map((value, index) => {
            if (value === 0) return undefined;
            const key = symbol.repeat(index + 1);
            return { key, value };
        })
        .filter(Boolean)
        .reduce((o, { key, value }) => {
            return { ...o, [key]: value };
        }, {});

    return Object.keys(table).reduce((all, key) => {
        return { ...all, ...rules(key, table[key]) };
    }, {});
};

/**
 * Converts strips to reels array. It's required only for dev.
 * mode, for full cycle simulation and payout calculation. 
 * Example:
 * 
 * Input: {a: [1, 2, 3], b: [2, 1, 1]}
 * Output: ['abb', 'aab', 'aaab']
 * 
 * Input parameter is an object where key is a symbol and array
 * value is a number of stops of specific symbol for corresponding
 * reel(at index). 
 * 
 * @param {object} strips object which represents
 */
export const stripsToReels = strips => Object.keys(strips)
    .reduce((reels, symbol) => {
        const stops = strips[symbol];
        const parts = stops.map(v => symbol.repeat(v));
        return parts.reduce((o, part, i) => {
            o[i] = o[i] ? o[i] + part : part;
            return o;
        }, reels);
    }, []);

/**
 * Loads macine configuration from the *.yaml file.
 * @param {string} file *.yaml file path. It must be relative to
 * Machine.js file.
 * @returns {Object} JSON object which represents machine configuration.
 */
export const load = (file, dev = false) => {
    const content = String(fs.readFileSync(resolve(__dirname, file)));
    const json = yaml.safeLoad(content);
    const paytable = normalizePaytable(json.paytable);
    const reels = dev
        ? stripsToReels(json.strips)
        : json.reels;
    return Object.freeze({ ...json, paytable, reels });
};

const machines = Object.freeze({
    mock: new Machine(load('config/mock.yaml'))
});

/**
 * Free spin machines. They are kept in a separte object
 * sinse they must not be listed by {@link #getMachineIds}
 * method. Specific free spin machine can be referenced by
 * by it's parent machine id, but not it's own, it's done
 * for several purpose:
 * 
 * 1. don't expose free spin machine through API
 * 2. internal API simplification. Spin method of the REST API 
 *    only deals with original machine id.
 * 
 * @see #getMachine
 * @see #getFreeSpinMachine
 */
const fmachines = Object.freeze({
    mock: new Machine(load('config/mock.yaml'))
    // mock: new Machine(load('config/freespin-mock.yaml'))
});

export default class MachineManager {

    getMachineIds = () => Object.keys(machines);

    getMachines = () => Object.keys(machines)
        .map(id => machines[id]);

    getMachine = id => machines[id];

    /**
    * Gets free spin machine by parent machine id.
    * @param {String} id regular(or parent) machine identifier.
    * @returns {Object} instance of the free spin machine or 
    * {@code undefined} in case machine for specified {@code id}
    * does not exists.
    * 
    * @see #machines
    * @see #fmachines
    * @see #getMachine
    */
    getFreeSpinMachine = id => fmachines[id];
}