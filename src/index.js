import FTPS from 'ftps-promise';
import path from 'path';
import command from './lib/helpers/cliHelper';
import { getConfig } from './lib/helpers/configHelper';
import { parseConfiguration } from './lib/helpers/keboolaHelper';
import { CONFIG_FILE, INPUT_TABLES_DIR } from './lib/constants';
import { uploadFilesToFTP, uploadFilesToFTPS } from './lib/helpers/ftpHelper';

(async() => {
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
    } = await parseConfiguration(getConfig(path.join(command.data, CONFIG_FILE)));
    // get the source directory.
    const sourceDir = path.join(command.data, INPUT_TABLES_DIR);
    // prepare the ftp/ftps object.
    if (protocol === "ftps") {
      const ftps = FTPS({ host, username, password, protocol, port, retries });
      // Process all files.
      const result = await Promise.all(
        uploadFilesToFTPS({ ftps, sourceDir, files, remotePath })
      );
      console.log(`${result.length} file(s) uploaded successfully!`);
    } else if (protocol === "ftp") {
      const ftpConfig = { host, port, user: username, password: password };
      // Process all files.
      const result = await Promise.all(
        uploadFilesToFTP({ ftpConfig, sourceDir, files, remotePath })
      );
      console.log(`${result.length} file(s) uploaded successfully!`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
