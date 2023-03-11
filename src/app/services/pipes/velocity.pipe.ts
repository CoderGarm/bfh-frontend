import {Pipe, PipeTransform} from "@angular/core";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Distance, Velocity} from "../swagger";
import {NumberShortPipe} from "./number-short.pipe";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import TimeMetricEnum = Velocity.TimeMetricEnum;

@Pipe({name: 'velocity'})
export class VelocityPipe implements PipeTransform {

    constructor(private numberShort: NumberShortPipe) {
    }

    transform(value: Velocity | undefined, targetDistanceMetric: string, targetTimeMetric: string): string {
        if (!value) {
            return "0 m/s";
        }
        const dMetric: DistanceMetricEnum = targetDistanceMetric as keyof typeof DistanceMetricEnum;
        const tMetric: TimeMetricEnum = targetTimeMetric as keyof typeof TimeMetricEnum;
        const result = NavigationCalculator.convertVelocityToMetric(value, dMetric, tMetric);

        const sol = NavigationCalculator.getSOLinMetric(dMetric, tMetric);
        if ((sol * 0.1) < result) {
            return (result / sol).toFixed(2) + " c";
        }
        return this.numberShort.transform(result) + ' ' + targetDistanceMetric.toLowerCase() + '/' + targetTimeMetric.toLowerCase();
    }
}
