const FTPS = require('ftps-promise');
const path = require('path');
const command = require('./lib/helpers/cliHelper');
const { getConfig } = require('./lib/helpers/configHelper');
const { parseConfiguration } = require('./lib/helpers/keboolaHelper');
const { CONFIG_FILE, INPUT_TABLES_DIR } = require('./lib/constants');
const {
  uploadFilesToFTP,
  uploadFilesToFTPS,
  uploadDirectoryToFTP
} = require('./lib/helpers/ftpHelper');

async function main() {
  try {
    // Read the input configuration.
    const {
      host,
      port,
      files,
      retries,
      username,
      password,
      protocol,
      remotePath,
      verbose,
      timeout,
      canUploadDirectory
    } = await parseConfiguration(
      getConfig(path.join(command.data, CONFIG_FILE))
    );
    // get the source directory.
    const sourceDir = path.join(command.data, INPUT_TABLES_DIR);
    // prepare the ftp/ftps object.
    if (protocol === 'ftps') {
      const ftps = FTPS({ host, username, password, protocol, port, retries });
      // Process all files.
      const result = await Promise.all(
        uploadFilesToFTPS({ ftps, sourceDir, files, remotePath })
      );
      console.log(`${result.length} file(s) uploaded successfully!`);
    } else if (protocol === 'ftp' || protocol === 'ftps_debug') {
      const ftpConfig = {
        host,
        port,
        user: username,
        password: password,
        secure: protocol === 'ftps_debug'
      };
      if (canUploadDirectory) {
        await uploadDirectoryToFTP({
          ftpConfig,
          sourceDir,
          remotePath,
          verbose,
          timeout,
          retries
        });
        console.log(
          `[INFO]: The content of data directory and file(s) were uploaded successfully!`
        );
      } else {
        await uploadFilesToFTP({
          ftpConfig,
          sourceDir,
          files,
          remotePath,
          verbose,
          timeout,
          retries
        });
        console.log(`[INFO]: All file(s) uploaded successfully!`);
      }
    }
    process.exit(0);
  } catch (error) {
    console.log(
      `[ERROR]: Upload failed (${error.message ? error.message : error})`
    );
    process.exit(1);
  }
}

main();
