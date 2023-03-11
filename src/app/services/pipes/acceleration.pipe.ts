import {Pipe, PipeTransform} from "@angular/core";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Acceleration, Distance} from "../swagger";
import {NumberShortPipe} from "./number-short.pipe";
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;

@Pipe({name: 'acceleration'})
export class AccelerationPipe implements PipeTransform {

    constructor(private numberShort: NumberShortPipe) {
    }

    transform(value: Acceleration | undefined, targetAccelerationMetric: string): string {
        if (!value) {
            return "0 g";
        }
        const metric: AccelerationMetricEnum = targetAccelerationMetric as keyof typeof AccelerationMetricEnum;
        const result = NavigationCalculator.convertAccelerationToMetric(value, metric);
        return this.numberShort.transform(result) + ' ' + metric;
    }
}
