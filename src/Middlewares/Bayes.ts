import * as fs from 'fs';
import { getBayesData } from '..';
import { Bayes } from '../Interfaces/Bayes';

const csv = require('csv-parser');

export function processCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        let data: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row: any) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (error: any) => {
                reject(error);
            });
    });
}

export function testMessage(message: string): Bayes {
    const data: any[] = getBayesData();
    const words = message.split(/\s+/);

    let labelNames = Object.keys(data[0]);
    labelNames = labelNames.filter(value => value.endsWith('P'));
    let averages = Object(null);

    for (let i = 0; i < labelNames.length; i++) {
        averages[labelNames[i]] = 1;
    }

    // Se itera cada palabra
    words.forEach(word => {
        // Se itera en el modelo
        for (const element of data) {
            if (word == element.word) {
                // Se itera sobre los labels
                let contador = 0;
                Object.entries(element).forEach(element => {
                    if (averages[element[0]]) {
                        averages[element[0]] *= element[1] as any;
                    }
                });
                break;
            }
        }
    });

    // Normalización
    let totalSum = 0;
    Object.values(averages).forEach(val => {
        totalSum += Number(val);
    });

    for (const key in averages) {
        averages[key] /= totalSum
    }

    return averages;
}
