import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'libs/main.js',
  output: {
    file: 'docs/js/libs/bundle.min.js',
    format: 'iife',
    name: 'App'
  },
  plugins: [
    resolve(),
    commonjs(),
    terser()
  ]
};