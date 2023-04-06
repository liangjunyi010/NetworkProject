const fs = require('fs');
const config = require("../../common/config.json");
const SFTPServer = require('node-sftp-server');

class SftpFileTransferServer {
    srv;
    constructor(
        port = config.sftp.serverDefaultPort
    ) {
    this.srv = new SFTPServer();
    this.srv.listen(port);

    this.srv.on("connect", function(auth, info) {
        // ssh_host_rsa_key needs to be in working drive OR
        // using ssh cli to import private key, which saves in [WINDOWS HOME DIR]/.ssh/id_rsa or /etc/ssh
        console.warn("authentication attempted, client info is: "+JSON.stringify(info)+", auth method is: "+auth.method);
        if (auth.method !== 'password' || auth.username !== "anonymous" || auth.password !== "123456") {
            return auth.reject(['password'],false);
        }
        console.warn("Authentication passed");

        return auth.accept(function(session) {
            session.on("readfile", function(path, writestream) {
                return fs.createReadStream(path).pipe(writestream);
            });
            return session.on("writefile", function(path, readstream) {
            var out = fs.createWriteStream(path);
            readstream.on("end",function() {console.warn("File written")});
            return readstream.pipe(out);
            });
        });
        });

    this.srv.on("error", function() {
    return console.warn("Example server encountered an error");
    });

    this.srv.on("end", function() {
    return console.warn("Example says user disconnected");
    });
    }

    shutDown() {
        this.ftpServer.close();
    }
}

module.exports = SftpFileTransferServer;
