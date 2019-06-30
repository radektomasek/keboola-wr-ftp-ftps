'use strict';
const path = require('path');
const { Client } = require('basic-ftp');
const fs = require('fs');

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

async function uploadFilesToFTP({ ftpConfig, sourceDir, files, remotePath }) {
  for (const file of files) {
    await putFileToFTP({ ftpConfig, sourceDir, remotePath, file });
  }
}

async function putFileToFTP({ ftpConfig, sourceDir, remotePath, file }) {
  const client = new Client();
  const sourceFile = path.join(sourceDir, file.source);
  const outputFile = path.join(remotePath, file.destination);
  client.ftp.verbose = true;
  try {
    await client.access({
      ...ftpConfig,
      secure: false
    });
    console.log(`[INFO]: Preparing upload of the ${file.source}`);
    await client.upload(fs.createReadStream(sourceFile), outputFile);
    console.log(`[INFO]: ${file.source} uploaded`);
  } catch (error) {
    throw error;
  }
  client.close();
}

module.exports = {
  uploadFilesToFTPS,
  putFileToFTPS,
  uploadFilesToFTP,
  putFileToFTP
};
