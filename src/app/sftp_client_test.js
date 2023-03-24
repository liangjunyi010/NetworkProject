var fs = require('fs');
let Client = require('ssh2-sftp-client');
let sftp = new Client();
let data = fs.createReadStream('./test/testData/Operation Oasis 1.22.11.20.zip');
let remote = 'D:/Documents/github_repos/node-sftp-server/Operation Oasis 1.22.11.20.zip';
sftp.connect({
  host: '10.12.65.14',
  port: '8022',
  username: 'brady',
  password: 'test'
}).then(() => {
    return sftp.put(data, remote);
  })
  .then(() => {
    return sftp.end();
  })
  .catch(err => {
    console.error(err.message);
  });