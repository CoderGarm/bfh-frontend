import {Acceleration, Distance} from "./services/swagger";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;

export class NavigationCalculator {

    private static distanceMetricValues: Map<DistanceMetricEnum, number> = new Map<Distance.DistanceMetricEnum, number>();
    static {
        this.distanceMetricValues.set(DistanceMetricEnum.M, 1);
        this.distanceMetricValues.set(DistanceMetricEnum.KM, 1000);
        this.distanceMetricValues.set(DistanceMetricEnum.LS, 299792458);
        this.distanceMetricValues.set(DistanceMetricEnum.LM, 17987547480);
        this.distanceMetricValues.set(DistanceMetricEnum.AU, 149597870700);
        this.distanceMetricValues.set(DistanceMetricEnum.LH, 1079252848800);
        this.distanceMetricValues.set(DistanceMetricEnum.LD, 25902068371200);
        this.distanceMetricValues.set(DistanceMetricEnum.LY, 9454254955488000);
        this.distanceMetricValues.set(DistanceMetricEnum.PC, 30856776000000000);
    }

    private static accelerationMetricValues: Map<AccelerationMetricEnum, number> = new Map<AccelerationMetricEnum, number>();
    static {
        this.accelerationMetricValues.set(AccelerationMetricEnum.MS2, 1);
        this.accelerationMetricValues.set(AccelerationMetricEnum.G, 9.81);
    }

    /**
     * Calculates the distance for the given time and acceleration.
     *
     * @param time the endurance of the acceleration in s
     * @param acceleration the acceleration in m/s²
     * @param targetMetric the target metric
     */
    static getRangeByTimeAndAcceleration(time: number, acceleration: Acceleration, targetMetric: AccelerationMetricEnum): number {
        const valueInTargetMetric = this.convertAccelerationToMetric(acceleration, targetMetric);
        let squaredTime = Math.pow(time, 2);
        return 0.5 * valueInTargetMetric * squaredTime;
    }

    static convertAccelerationToMetric(distance: Acceleration, targetMetric: AccelerationMetricEnum): number {
        if (distance.accelerationMetric == targetMetric) {
            return distance.accelerationValue;
        }

        const factor = NavigationCalculator.getAccelerationConversionFactor(distance.accelerationMetric, targetMetric);
        return distance.accelerationValue * factor;
    }

    private static getAccelerationConversionFactor(originalMetric: AccelerationMetricEnum, targetMetric: AccelerationMetricEnum) {

        const originalMetricValue: number | undefined = this.accelerationMetricValues.get(originalMetric);
        const targetMetricValue: number | undefined = this.accelerationMetricValues.get(targetMetric);
        if (originalMetric == undefined || targetMetric == undefined) {
            throw new Error("There must be both metrics present.");
        }
        return originalMetricValue! / targetMetricValue!;
    }

    static convertDistanceToMetric(distance: Distance, targetMetric: DistanceMetricEnum): number {
        if (distance.distanceMetric == targetMetric) {
            return distance.coordinate;
        }

        const factor = NavigationCalculator.getDistanceConversionFactor(distance.distanceMetric, targetMetric);
        return distance.coordinate * factor;
    }

    private static getDistanceConversionFactor(originalMetric: DistanceMetricEnum, targetMetric: DistanceMetricEnum) {

        const originalMetricValue: number | undefined = this.distanceMetricValues.get(originalMetric);
        const targetMetricValue: number | undefined = this.distanceMetricValues.get(targetMetric);
        if (originalMetric == undefined || targetMetric == undefined) {
            throw new Error("There must be both metrics present.");
        }
        return originalMetricValue! / targetMetricValue!;
    }
}
