const FTPS = require('ftps-promise');
const path = require('path');
const command = require('./lib/helpers/cliHelper');
const { getConfig } = require('./lib/helpers/configHelper');
const { parseConfiguration } = require('./lib/helpers/keboolaHelper');
const { CONFIG_FILE, INPUT_TABLES_DIR } = require('./lib/constants');
const {
  uploadFilesToFTP,
  uploadFilesToFTPS
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
      remotePath
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
    } else if (protocol === 'ftp') {
      const ftpConfig = {
        host,
        port,
        user: username,
        password: password
      };
      await uploadFilesToFTP({ ftpConfig, sourceDir, files, remotePath });
      console.log(`All file(s) uploaded successfully!`);
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
