import {Pipe, PipeTransform} from "@angular/core";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Time} from "../swagger";
import {NumberShortPipe} from "./number-short.pipe";
import TimeMetricEnum = Time.TimeMetricEnum;

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {

    constructor(private numberShort: NumberShortPipe) {
    }

    transform(value: Time | undefined, targetTimeMetric: string): string {
        if (!value) {
            return "0 s";
        }
        const metric: TimeMetricEnum = targetTimeMetric as keyof typeof TimeMetricEnum;
        const result = NavigationCalculator.convertTimeToMetric(value, metric);
        return this.numberShort.transform(result) + ' ' + metric;
    }
}
