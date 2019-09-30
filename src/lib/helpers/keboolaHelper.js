'use strict';
const moment = require('moment');
const { isEmpty, isUndefined } = require('lodash');
const {
  DEFAULT_PORT,
  DEFAULT_DATE_FORMAT,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_NUMBER_OF_RETRIES
} = require('../constants');
// This function check the input configuration specified in KBC.
// Check whether the required fields are provided.
// Prepare simple output that is going to be used in later phases.
async function parseConfiguration(configObject) {
  return new Promise((resolve, reject) => {
    const inputFiles = configObject.get('storage:input:tables');
    // If no file is specified, we can stop the processing.
    if (isUndefined(inputFiles) || isEmpty(inputFiles)) {
      reject('No KBC Bucket/Table selected!');
    }
    const host = configObject.get('parameters:remote_host');
    // If no host is specified, we can stop the processing.
    if (isUndefined(host)) {
      reject(
        'Missing host parameter in the configuration! Please add a FTP/FTPS remote host to your configuration!'
      );
    }
    const username = configObject.get('parameters:username');
    const password = configObject.get('parameters:#password');
    if (isUndefined(username) || isUndefined(password)) {
      reject(
        'Neither username nor password specified in your configuration! Please add your FTP/FTPS credentials to your configuration!'
      );
    }
    const protocol = configObject.get('parameters:protocol');
    if (isUndefined(protocol)) {
      reject(
        'Protocol parameter missing! Please set either ftp or ftps value to protocol attribute in your configuration!'
      );
    }
    // Remote path
    const remotePathParam = configObject.get('parameters:remote_path') || '/';
    const remotePath =
      remotePathParam === '/' ? DEFAULT_OUTPUT_DIR : remotePathParam;
    // Read the port. If not specified, the default one is used.
    const port = configObject.get('parameters:port') || DEFAULT_PORT;
    // get the number of retries.
    const retries =
      configObject.get('parameters:retries') || DEFAULT_NUMBER_OF_RETRIES;
    // We should allow processing of the FTP/FTPS protocols in this connector only. Let's do a particular test
    const protocolCheckExpression = /ftp|ftps|ftps_debug/;
    if (!protocolCheckExpression.test(protocol.toLowerCase())) {
      reject(
        'Only ftp or ftps protocols are allowed! Please update your configuration!'
      );
    }
    const verbose = !isUndefined(configObject.get('parameters:verbose'))
      ? configObject.get('parameters:verbose')
      : false;
    // Check whether a user wants to append a datetime to a filename.
    const appendDatetime = !isUndefined(
      configObject.get('parameters:append_datetime')
    )
      ? configObject.get('parameters:append_datetime')
      : false;
    // We should specify the datetime format
    const dateTimeFormat =
      !isUndefined(configObject.get('parameters:datetime_format')) &&
      !isEmpty(configObject.get('parameters:datetime_format'))
        ? configObject.get('parameters:datetime_format')
        : DEFAULT_DATE_FORMAT;
    const inputDate = moment().format(dateTimeFormat);
    // placeholder
    const placeholderString = configObject.get('parameters:placeholder');
    const hasPlaceholder =
      !isUndefined(placeholderString) &&
      placeholderString.includes('%%table%%') &&
      placeholderString.includes('%%datetime%%') &&
      appendDatetime;
    const fileNameExtension = appendDatetime ? `.${inputDate}` : '';
    const files = generateSourceDestinationMapping(
      inputFiles,
      hasPlaceholder,
      appendDatetime,
      inputDate,
      placeholderString,
      fileNameExtension
    );

    // If everything is all right, we should return the params object.
    resolve({
      host,
      port,
      files,
      retries,
      username,
      password,
      protocol,
      remotePath,
      verbose
    });
  });
}

/**
 * This functions prepares array of source and destination files which are going to be uploaded on the remote location.
 */
function generateSourceDestinationMapping(
  inputFiles,
  hasPlaceholder,
  appendDatetime,
  datetime,
  placeholder
) {
  return inputFiles.map(file => {
    return {
      source: file.destination,
      destination: generateDestinationName(
        file.destination,
        hasPlaceholder,
        appendDatetime,
        datetime,
        placeholder
      )
    };
  });
}

/**
 * This function generates the actual destination name.
 */
function generateDestinationName(
  fileName,
  hasPlaceholder,
  appendDatetime,
  datetime,
  placeholder
) {
  if (!hasPlaceholder) {
    return appendDatetime ? `${fileName}.${datetime}` : `${fileName}`;
  } else {
    const hasCsvSuffix = fileName.endsWith('.csv');
    const table = hasCsvSuffix
      ? fileName.slice(0, fileName.indexOf('.csv'))
      : fileName;
    const remoteDestinationFile = placeholder
      .replace('%%table%%', table)
      .replace('%%datetime%%', datetime);
    return hasCsvSuffix
      ? `${remoteDestinationFile}.csv`
      : remoteDestinationFile;
  }
}

module.exports = {
  parseConfiguration,
  generateSourceDestinationMapping,
  generateDestinationName
};
