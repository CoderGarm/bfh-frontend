import {Pipe, PipeTransform} from "@angular/core";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Acceleration, Distance, MissileMotor} from "../swagger";
import {NumberShortPipe} from "./number-short.pipe";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;

@Pipe({name: 'missileEndurance'})
export class MissileEndurancePipe implements PipeTransform {

    constructor(private numberShort: NumberShortPipe) {
    }

    transform(value: MissileMotor | undefined, targetDistanceMetric: string): string {
        if (!value) {
            return "0 M";
        }
        const metric: DistanceMetricEnum = targetDistanceMetric as keyof typeof DistanceMetricEnum;

        const range = NavigationCalculator.getRangeByTimeAndAcceleration(value.endurance, value.acceleration, AccelerationMetricEnum.MS2);
        const number = NavigationCalculator.convertDistanceToMetric({coordinate: range, distanceMetric: DistanceMetricEnum.M}, metric);
        return this.numberShort.transform(number) + ' ' + metric.toLowerCase();
    }
}
