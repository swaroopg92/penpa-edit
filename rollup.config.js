import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: 'libs/main.js',
        output: {
            file: 'docs/js/libs/bundle.min.js',
            format: 'iife',
            name: 'AppBundle'
        },
        plugins: [
            resolve(),
            commonjs(),
            terser()
        ]
    },
    {
        input: 'libs/timer.js',
        output: {
            file: 'docs/js/libs/timerbundle.min.js',
            format: 'iife',
            name: 'TimerBundle'
        },
        plugins: [
            resolve(),
            commonjs(),
            terser()
        ]
    }
];