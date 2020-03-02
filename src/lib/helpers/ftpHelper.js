'use strict';
const fs = require('fs');
const path = require('path');
const retry = require('async-retry');
const { Client } = require('basic-ftp');
const { DEFAULT_RETRY_TIMEOUT } = require('../constants');

function uploadFilesToFTPS({ ftps, sourceDir, files, remotePath }) {
  return files.map(file => {
    return putFileToFTPS({ ftps, sourceDir, remotePath, file });
  });
}

function putFileToFTPS({ ftps, sourceDir, remotePath, file }) {
  return new Promise((resolve, reject) => {
    const sourceFile = path.join(sourceDir, file.source);
    const outputFile = path.join(remotePath, file.destination);
    ftps.put(sourceFile, outputFile).then(response => {
      response.error.length === 0
        ? resolve(`${outputFile} file successfully uploaded!`)
        : reject(response.error);
    });
  });
}

async function uploadDirectoryToFTP({
  ftpConfig,
  sourceDir,
  remotePath,
  verbose,
  timeout,
  retries
}) {
  const client = new Client(timeout);
  if (verbose) {
    client.trackProgress(info => {
      console.log('File', info.name);
      console.log('Type', info.type);
      console.log('Transferred', info.bytes);
      console.log('Transferred Overall', info.bytesOverall);
    });
    client.ftp.verbose = verbose;
  }

  try {
    await client.access({
      ...ftpConfig
    });

    await retry(
      async (bail, retryAttempt) => {
        if (retryAttempt > 1) {
          console.log(`[INFO]: Trying to reconnect to the FTP`);
          await client.access({
            ...ftpConfig
          });
        }
        console.log(
          `[INFO]: Uploading content of the data directory, attempt: ${retryAttempt}/${retries}`
        );
        await client.uploadFromDir(sourceDir, remotePath);
      },
      {
        retries,
        minTimeout: DEFAULT_RETRY_TIMEOUT
      }
    );
  } catch (error) {
    throw error;
  }
}

async function uploadFilesToFTP({
  ftpConfig,
  sourceDir,
  files,
  remotePath,
  verbose,
  timeout,
  retries
}) {
  try {
    const client = new Client(timeout);
    if (verbose) {
      client.trackProgress(info => {
        console.log('File', info.name);
        console.log('Type', info.type);
        console.log('Transferred', info.bytes);
        console.log('Transferred Overall', info.bytesOverall);
      });
      client.ftp.verbose = verbose;
    }

    await client.access({
      ...ftpConfig
    });

    console.log(`[INFO]: Successfully connected to a remote location`);

    for (const file of files) {
      await retry(
        async (bail, retryAttempt) => {
          if (retryAttempt > 1) {
            console.log(`[INFO]: Trying to reconnect to the FTP`);
            await client.access({
              ...ftpConfig
            });
          }

          await putFileToFTP({
            client,
            sourceDir,
            remotePath,
            file,
            retryAttempt,
            retries
          });
        },
        {
          retries,
          minTimeout: DEFAULT_RETRY_TIMEOUT
        }
      );
    }

    console.log(`[INFO]: Disconnecting from the remote location`);
    client.close();
  } catch (error) {
    throw error;
  }
}

async function putFileToFTP({
  client,
  sourceDir,
  remotePath,
  file,
  retryAttempt,
  retries
}) {
  const sourceFile = path.join(sourceDir, file.source);
  const outputFile = path.join(remotePath, file.destination);

  try {
    console.log(
      `[INFO]: Preparing upload of the ${file.source}, attempt no. ${retryAttempt}/${retries}`
    );
    await client.upload(
      fs.createReadStream(sourceFile, { encoding: 'utf8' }),
      outputFile
    );
    console.log(`[INFO]: ${file.source} uploaded`);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  uploadFilesToFTPS,
  putFileToFTPS,
  uploadFilesToFTP,
  putFileToFTP,
  uploadDirectoryToFTP
};
