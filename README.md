# Keboola Writer for FTP/FTPS

A FTP/FTPS Keboola Connect Writer component that handles data writing from KBC storage to a remote location via FTP/FTPS protocol. Written in Node.js with utilization of Babel/ES6/ES7 functionality.

## Settings

Configuration is very straightforward. One has to select input files from Keboola Storage, put credentials and you are all set. The possible options are described below.

### Table selection

A Keboola helper for Table Input Mapping selection is enabled. It's a GUI component that simplify the input table selection and enabled some advanced functionality like columns specification. Feel free to experiment with this.

### FTP/FTPS settings

The configuration structure for the FTP/FTPS Writer is very straightforward and there is a GUI helper that helps you to prepare the configuration. Check out the summary in the list below.

* Remote host - FTP/FTPS hostname.
* Username - FTP/FTPS username.
* Password - FTP/FTPS password. Will be encrypted.
* Protocol - ftp/ftps. Default value set to ftp.  
* Remote path - path within FTP/FTPS. Default value set to '/'.
* Port - port of the remote host. Default value set to 21.
* Append datetime - true/false. A flag for making a datetime the part of the name. Default value set to false.
* Datetime format - standard ISO 8601 symbols for specifying the datetime (if append datetime set to true).
* Placeholder - This is relevant to output filename. See the details below.
* Connection retries - a number of possible retries if something goes wrong. Default value set to 5.

### Credentials

The required parameters are **Remote host**, **Username**, **Password** and **Protocol**. There must be a non-empty value for each of these parameter in the input configuration. If not, the execution will failed.

### Datetime configuration

You can append a datetime suffix at the end of the filename. Just set **Append datetime** parameter in the configuration to true. The default format of datetime suffix is **YYYYMMDD_HHmmss**, but you can simply updating it by changing **Datetime format** parameter.

### Placeholder

If you set the append datetime parameter to true, you can specify how the final file name will look like. The placeholder must contains **%%table%%** and **%%datetime%%** strings and you can basically mix the output in any way you want. (e.g.: **%%table%%**_**%%datetime%%**). If string is empty or specified incorrectly, a default format is applied.   
