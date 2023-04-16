#!/usr/bin/env node
import * as fs from 'fs';
import {spawn} from 'child_process';
import chalk from 'chalk';

/**
 * Class FileAnalizePipe . Su función es analizar un archivo a través del comando "wc".
 * 
 * @param filename      Ruta y nombre del archivo a analizar.
 * @param error         Si el programa falla, se pone en "True".
 * @param arguments[]   Contiene los parámetros para el comando "wc":
 *     - "--line" => Numero de líneas
 *     - "--words" => Número de palabras
 *     - "--chars" => Número de caracteres
 */
export class FileAnalizePipe {
    private arguments: string[];
    private _error = true;
    constructor (
        private filename: string,
        ...argument: string[]
    ) {
        this.arguments = argument;
        this.error = this.fileCheck();
        if (!this.error) {
            argument.forEach((arg) => {
                this.fileInfo(arg);
            });
        }
    }

    /**
     * fileCheck . Comprueba si la lectura del archivo puede ejecutarse de forma correcta:
     *      - Comprueba si se puede acceder a él.
     *      - Comprueba si el número de facilitados es correcto.
     */
    fileCheck ( ): boolean {
        if ((this.arguments.length < 1) || (this.arguments.length > 3)) {
            console.log(chalk.red('At least, a file analyze and a command must be specified'));
            return true;
        } else {
            return false;
        }
    }

    /**
     * fileInfo . Se encarga de tratar la información recibida por el comando "cat" que ha trabajado como intermediario para
     * volcar la información de un archivo sobre el comando "wc" a través de su subproceso pipe heredado de "child-proccess".
     * su salida para a una variable que pasará a mostrarse por pantalla en el momento que se termine el proceso.
     * 
     * @param argument Flag que utilizará "wc" para tratar la información recibida por cat del archivo.
     */
    fileInfo ( argument: string ): void {
        fs.access(this.filename, fs.constants.F_OK, (err) => {
            if ((err) && (!this.error)){
                console.log(chalk.red(`File ${this.filename} does not exist.`));
                this.error = true;
                return;
            } else if (!this.error){
                const cat = spawn('cat', [this.filename]);
                const wc = spawn('wc', [argument]);
                cat.stdout.pipe(wc.stdin);
                let info = '';
                wc.stdout.on('data', (output) => {
                    info += output;
                });
                wc.on('close', () => {
                    const infoArray = info.split(/\s+/);
                    switch (argument) {
                        case ('-l' || '--lines'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` lines.`);
                            break;
                        case ('-w' || '--words'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` words.`);
                            break;
                        case ('-m' || '--chars'):
                            console.log(`File ` + chalk.green(this.filename) + ` has ` + chalk.green(infoArray[0]) +` characters.`);
                            break;
                    }
                });
            }
        });       
    }

    public get error(): boolean {
        return this._error;
    }
    public set error(value: boolean) {
        this._error = value;
    }
}