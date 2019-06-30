'use strict';
const program = require('commander');
const { DEFAULT_DATA_DIR } = require('../constants');

program
  .version('1.0.0')
  .option(
    '-d, --data <path>',
    `set path to the config directory, defaults to ${DEFAULT_DATA_DIR}`,
    DEFAULT_DATA_DIR
  )
  .parse(process.argv);

module.exports = program;
