import {Pipe, PipeTransform} from "@angular/core";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Distance} from "../swagger";
import {NumberShortPipe} from "./number-short.pipe";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

@Pipe({name: 'dynamicDistance'})
export class DynamicDistancePipe implements PipeTransform {

    constructor(private numberShort: NumberShortPipe) {
    }

    transform(value: Distance | undefined): string {
        if (!value) {
            return "0 M";
        }

        let canRun: boolean = true;
        let metric: DistanceMetricEnum = DistanceMetricEnum.PC;
        let result = NavigationCalculator.convertDistanceToMetric(value, metric);
        while (canRun && Math.abs(result) < 1) {
            const input = metric;
            metric = NavigationCalculator.getNextSmallerDistanceMetric(metric);
            if (input === metric) {
                canRun = false;
            }
            result = NavigationCalculator.convertDistanceToMetric(value, metric);
        }
        return this.numberShort.transform(result) + ' ' + metric.toLowerCase();
    }
}
