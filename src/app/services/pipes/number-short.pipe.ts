import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'numberShort'})
export class NumberShortPipe implements PipeTransform {

    private formatter: Intl.NumberFormat;

    constructor() {
        // always use english shortenings - other languages like german didn't have it
        // but use dot as separator
        this.formatter = Intl.NumberFormat('en', {notation: 'compact'});
    }

    transform(value: number | undefined, ...args: any[]): string {
        if (!value) {
            return "0";
        }
        let result = this.formatter.format(value);
        if (result.includes('K')) {
            result = result.toLowerCase();
        }
        return result;
    }
}
