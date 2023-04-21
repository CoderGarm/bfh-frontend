import {Pipe, PipeTransform} from "@angular/core";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Mass} from "../swagger";
import {NumberThousandSeparatorPipe} from "./number-thousand-separator.pipe";
import MassMetricEnum = Mass.MassMetricEnum;

@Pipe({name: 'mass'})
export class MassPipe implements PipeTransform {

    constructor(private numberShort: NumberThousandSeparatorPipe) {
    }

    transform(value: Mass | undefined, targetMassMetric: string): string {
        if (!value) {
            return "0 t";
        }
        const metric: MassMetricEnum = targetMassMetric as keyof typeof MassMetricEnum;
        const result = NavigationCalculator.convertMassToMetric(value, metric);
        return this.numberShort.transform(Math.round(result)) + ' ' + metric.toLowerCase();
    }
}
