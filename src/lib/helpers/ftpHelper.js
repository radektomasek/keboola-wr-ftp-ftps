'use strict';
const path = require('path');
const PromiseFtp = require('promise-ftp');

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
    const message = await putFileToFTP({
      ftpConfig,
      sourceDir,
      remotePath,
      file
    });
    console.log(message);
  }
}

async function putFileToFTP({ ftpConfig, sourceDir, remotePath, file }) {
  return new Promise((resolve, reject) => {
    const ftp = new PromiseFtp();
    const sourceFile = path.join(sourceDir, file.source);
    const outputFile = path.join(remotePath, file.destination);
    ftp
      .connect(ftpConfig)
      .then(() => {
        console.log(`[INFO]: Preparing upload of the ${file.source}`);
        return ftp.put(sourceFile, outputFile);
      })
      .then(() => {
        ftp.end();
        return resolve(`[INFO]: ${file.source} uploaded`);
      })
      .catch(error => {
        return reject(error);
      });
  });
}

module.exports = {
  uploadFilesToFTPS,
  putFileToFTPS,
  uploadFilesToFTP,
  putFileToFTP
};
