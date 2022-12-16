import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'numberRomanPipe'})
export class NumberRomanPipe implements PipeTransform {

    private numerals = [
        ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'], // 1-9
        ['X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'], // 10-90
        ['C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'], // 100-900
        ['M', 'MM', 'MMM'], // 1000-3000
    ];

    constructor() {
    }

    transform(value: number | undefined, ...args: any[]): string {
        if (!value) {
            return '';
        }
        return this.int2roman(value);
    }

    private int2roman = (original: number): string => {
        if (original < 1 || original > 3999) {
            throw new Error('Error: Input integer limited to 1 through 3,999');
        }

        // TODO: Could expand to support fractions, simply rounding for now
        const digits = Math.round(original).toString().split('');
        let position = (digits.length - 1);

        return digits.reduce((roman, digit) => {
            if (digit !== '0') {
                roman += this.numerals[position][parseInt(digit) - 1];
            }

            position -= 1;

            return roman;
        }, '');
    }
}