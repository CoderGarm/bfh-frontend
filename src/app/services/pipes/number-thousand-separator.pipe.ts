import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'numberThousandSeparator'})
export class NumberThousandSeparatorPipe implements PipeTransform {

    private formatter: Intl.NumberFormat;

    constructor() {
        // always use german in number formatting to have a dot as thousands separator
        this.formatter = Intl.NumberFormat('de', {useGrouping: true});
    }

    transform(value: number | undefined, ...args: any[]): string {
        if (!value) {
            return "0";
        }
        return this.formatter.format(value);
    }
}