'use strict';
import path from 'path';
import PromiseFtp from 'promise-ftp';

export function uploadFilesToFTPS({ ftps, sourceDir, files, remotePath }) {
  return files.map(file => {
    return putFileToFTPS({ ftps, sourceDir, remotePath, file });
  });
}

export function putFileToFTPS({ ftps, sourceDir, remotePath, file }) {
  return new Promise((resolve, reject) => {
    const sourceFile = path.join(sourceDir, file.source);
    const outputFile = path.join(remotePath, file.destination);
    ftps.put(sourceFile, outputFile)
      .then(response => {
        response.error.length === 0
          ? resolve(`${outputFile} file successfully uploaded!`)
          : reject(response.error)
      })
  });
}

export function uploadFilesToFTP({ ftpConfig, sourceDir, files, remotePath }) {
  return files.map(file => {
    return putFileToFTP({ ftpConfig, sourceDir, remotePath, file });
  });
}

export function putFileToFTP({ ftpConfig, sourceDir, remotePath, file }) {
  return new Promise((resolve, reject) => {
    const ftp = new PromiseFtp();
    const sourceFile = path.join(sourceDir, file.source);
    const outputFile = path.join(remotePath, file.destination);
    ftp.connect(ftpConfig)
      .then(() => {
        return ftp.put(sourceFile, outputFile);
      })
      .then(() => {
        ftp.end();
        resolve(`${outputFile} file successfully uploaded!`);
      })
      .catch(error => {
        reject(error);
      });
  });
}
