"use strict";
export const __esModule = true;
// eslint-disable-next-line @typescript-eslint/no-var-requires
import net_1 from "net";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { exec } from "child_process";
var server = net_1["default"].createServer(function (socket) {
    console.log('Cliente conectado.');
    socket.on('data', function (data) {
        var comando = data.toString().trim();
        (0, exec)(comando, function (error, stdout, stderr) {
            if (error) {
                socket.write("Error: ".concat(error.message));
            }
            else if (stderr) {
                socket.write("Error: ".concat(stderr));
            }
            else {
                socket.write(stdout);
            }
            socket.end();
        });
    });
    socket.on('end', function () {
        console.log('Cliente desconectado.');
    });
});
server.listen(60300, '127.0.0.1', function () {
    console.log('Servidor escuchando en el puerto 60300.');
});
