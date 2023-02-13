import {Pipe, PipeTransform} from "@angular/core";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Distance} from "../swagger";
import {NumberShortPipe} from "./number-short.pipe";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

@Pipe({name: 'distance'})
export class DistancePipe implements PipeTransform {

    constructor(private numberShort: NumberShortPipe) {
    }

    transform(value: Distance | undefined, targetDistanceMetric: string): string {
        if (!value) {
            return "0 M";
        }
        const metric: DistanceMetricEnum = targetDistanceMetric as keyof typeof DistanceMetricEnum;
        const result = NavigationCalculator.convertDistanceToMetric(value, metric);
        return this.numberShort.transform(result) + ' ' + metric;
    }
}