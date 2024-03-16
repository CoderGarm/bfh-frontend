import {Acceleration, Distance, Mass, Orbit, Propulsion, Time, Velocity} from "../swagger";
import {ArrayXY} from "@svgdotjs/svg.js";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;
import TechnologyTypeEnum = Propulsion.TechnologyTypeEnum;
import TimeMetricEnum = Velocity.TimeMetricEnum;
import MassMetricEnum = Mass.MassMetricEnum;

export enum Direction {
    NORTH,
    EAST,
    SOUTH,
    WEST
}

export class NavigationCalculator {

    private static timeMetricValues: Map<TimeMetricEnum, number> = new Map<TimeMetricEnum, number>();
    static {
        this.timeMetricValues.set(TimeMetricEnum.SECOND, 1);
        this.timeMetricValues.set(TimeMetricEnum.MINUTE, 60);
        this.timeMetricValues.set(TimeMetricEnum.HOUR, 3600);
        this.timeMetricValues.set(TimeMetricEnum.DAY, 86400);
        this.timeMetricValues.set(TimeMetricEnum.WEEK, 604800);
        this.timeMetricValues.set(TimeMetricEnum.MONTH, 2419200);
        this.timeMetricValues.set(TimeMetricEnum.YEAR, 29030400);
    }

    private static massMetricValues: Map<MassMetricEnum, number> = new Map<MassMetricEnum, number>();
    static {
        this.massMetricValues.set(MassMetricEnum.KG, 1);
        this.massMetricValues.set(MassMetricEnum.T, 1000);
        this.massMetricValues.set(MassMetricEnum.KT, 1000000);
        this.massMetricValues.set(MassMetricEnum.MT, 1000000000);
    }

    private static distanceMetricValues: Map<DistanceMetricEnum, number> = new Map<DistanceMetricEnum, number>();
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

    private static velocityRestriction: Map<TechnologyTypeEnum, number> = new Map<TechnologyTypeEnum, number>();
    static {
        this.velocityRestriction.set(TechnologyTypeEnum.CIVIL, 0.6);
        this.velocityRestriction.set(TechnologyTypeEnum.MILITARY, 0.8);
    }

    static getSOLinMetric(dMetric: DistanceMetricEnum, tMetric: TimeMetricEnum): number {
        return NavigationCalculator.convertVelocityToMetric({
            value: this.distanceMetricValues.get(DistanceMetricEnum.LS)!,
            distanceMetric: DistanceMetricEnum.M,
            timeMetric: TimeMetricEnum.SECOND
        }, dMetric, tMetric);
    }

    /**
     * Calculates the distance for the given time and acceleration.
     *
     * @param time the endurance of the acceleration in s
     * @param acceleration the acceleration in m/s²
     * @param targetMetric the target metric
     */
    static getRangeByTimeAndAcceleration(time: Time, acceleration: Acceleration, targetMetric: AccelerationMetricEnum): number {
        const timeToMetric = this.convertTimeToMetric(time, TimeMetricEnum.SECOND);
        const valueInTargetMetric = this.convertAccelerationToMetric(acceleration, targetMetric);
        let squaredTime = Math.pow(timeToMetric, 2);
        return 0.5 * valueInTargetMetric * squaredTime;
    }

    static convertAccelerationToMetric(distance: Acceleration, targetMetric: AccelerationMetricEnum): number {
        if (distance.accelerationMetric == targetMetric) {
            return distance.value;
        }

        const factor = NavigationCalculator.getAccelerationConversionFactor(distance.accelerationMetric, targetMetric);
        return distance.value * factor;
    }

    private static getAccelerationConversionFactor(originalMetric: AccelerationMetricEnum, targetMetric: AccelerationMetricEnum) {

        const originalMetricValue: number | undefined = this.accelerationMetricValues.get(originalMetric);
        const targetMetricValue: number | undefined = this.accelerationMetricValues.get(targetMetric);
        if (originalMetric == undefined || targetMetric == undefined) {
            throw new Error("There must be both metrics present.");
        }
        return originalMetricValue! / targetMetricValue!;
    }

    static convertVelocityToMetric(velocity: Velocity, dMetric: DistanceMetricEnum, tMetric: TimeMetricEnum): number {
        if (velocity.distanceMetric === dMetric && velocity.timeMetric === tMetric) {
            return velocity.value;
        }

        const factor = NavigationCalculator.getVelocityConversionFactor(velocity, dMetric, tMetric);
        return velocity.value * factor;
    }

    private static getVelocityConversionFactor(velocity: Velocity, dMetric: DistanceMetricEnum, tMetric: TimeMetricEnum) {
        const tFactor = NavigationCalculator.getTimeConversionFactor(velocity.timeMetric, tMetric);
        const dFactor = NavigationCalculator.getDistanceConversionFactor(velocity.distanceMetric, dMetric);

        return tFactor * dFactor;
    }

    static convertMassToMetric(distance: Mass, targetMetric: MassMetricEnum): number {
        if (distance.massMetric == targetMetric) {
            return distance.coordinate;
        }

        const factor = NavigationCalculator.getMassConversionFactor(distance.massMetric, targetMetric);
        return distance.coordinate * factor;
    }

    private static getMassConversionFactor(originalMetric: MassMetricEnum, targetMetric: MassMetricEnum) {

        const originalMetricValue: number | undefined = this.massMetricValues.get(originalMetric);
        const targetMetricValue: number | undefined = this.massMetricValues.get(targetMetric);
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

    static convertTimeToMetric(distance: Time, targetMetric: TimeMetricEnum): number {
        if (distance.timeMetric == targetMetric) {
            return distance.coordinate;
        }

        const factor = NavigationCalculator.getTimeConversionFactor(distance.timeMetric, targetMetric);
        return distance.coordinate * factor;
    }

    private static getTimeConversionFactor(originalMetric: TimeMetricEnum, targetMetric: TimeMetricEnum) {

        const originalMetricValue: number | undefined = this.timeMetricValues.get(originalMetric);
        const targetMetricValue: number | undefined = this.timeMetricValues.get(targetMetric);
        if (originalMetric == undefined || targetMetric == undefined) {
            throw new Error("There must be both metrics present.");
        }
        return originalMetricValue! / targetMetricValue!;
    }

    static calculateDistance(firstCoordinate: number, secondCoordinate: number): number {
        return Math.sqrt(Math.pow(firstCoordinate, 2) + Math.pow(secondCoordinate, 2));
    }

    static getAngle(origin: { x: number, y: number }, destination: { x: number, y: number }): number {
        return NavigationCalculator.getAngleDegrees(
            origin.x,
            origin.y,
            destination.x,
            destination.y, true
        );
    }

    static getAngleDegrees(x1: number, y1: number, x2: number, y2: number, force360 = true) {
        let deltaX = x1 - x2;
        let deltaY = y1 - y2; // reverse
        let radians = Math.atan2(deltaY, deltaX)
        let degrees = (radians * 180) / Math.PI - 90; // rotate
        if (force360) {
            while (degrees >= 360) degrees -= 360;
            while (degrees < 0) degrees += 360;
        }
        //console.log('angle to degree:', {deltaX, deltaY, radians, degrees})
        return degrees;
    }

    static moveAbout(x: number, y: number, angle: number, distance: number): { x: number, y: number } {
        const radians = angle * (Math.PI / 180);
        const x1 = x + (Math.sin(radians) * distance);
        const y1 = y - (Math.cos(radians) * distance);
        return {x: x1, y: y1};
    }

    static rotatePoint(center: ArrayXY, angle: number, toRotate: ArrayXY): ArrayXY {
        let s = Math.sin(NavigationCalculator.toRad(angle));
        let c = Math.cos(NavigationCalculator.toRad(angle));

        // translate point back to origin:
        toRotate[0] -= center[0];
        toRotate[1] -= center[1];

        // rotate point
        let xnew = toRotate[0] * c - toRotate[1] * s;
        let ynew = toRotate[0] * s + toRotate[1] * c;

        // translate point back:
        toRotate[0] = xnew + center[0];
        toRotate[1] = ynew + center[1];
        return toRotate;
    }

    static toRad(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    static calculateDistanceOfPoints(first: ArrayXY, second: ArrayXY): number {
        return Math.sqrt(Math.pow(first[0] - second[0], 2) + Math.pow(first[1] - second[1], 2));
    }

    static calculateDistanceOfOrbits(first: Orbit, second: Orbit, distanceMetric: DistanceMetricEnum): number {
        const originX = NavigationCalculator.convertDistanceToMetric(first.xCoordinate, distanceMetric);
        const originY = NavigationCalculator.convertDistanceToMetric(first.yCoordinate, distanceMetric);
        const destinationX = NavigationCalculator.convertDistanceToMetric(second.xCoordinate, distanceMetric);
        const destinationY = NavigationCalculator.convertDistanceToMetric(second.yCoordinate, distanceMetric);

        return NavigationCalculator.calculateDistanceOfPoints([originX, originY], [destinationX, destinationY]);
    }

    static getDirection(angle: number): Direction[] {
        angle = Math.round(angle);
        if (angle == 45) {
            return [Direction.EAST, Direction.NORTH];
        }
        if (angle == 135) {
            return [Direction.WEST, Direction.NORTH];
        }
        if (angle == 315) {
            return [Direction.SOUTH, Direction.EAST];
        }
        if (angle == 215) {
            return [Direction.WEST, Direction.SOUTH];
        }
        if (angle > 45 && angle < 135) {
            return [Direction.NORTH];
        }
        if (angle < 45 || angle > 315) {
            return [Direction.EAST];
        }
        if (angle < 315 && angle > 215) {
            return [Direction.SOUTH];
        }
        if (angle < 215 && angle > 135) {
            return [Direction.WEST];
        }
        throw new Error("Of my gosh, the angle '" + angle + "' is missing!");
    }

    static getDirectionAsString(direction: Direction) {
        switch (direction) {
            case Direction.NORTH:
                return 'NORTH';
            case Direction.EAST:
                return 'EAST';
            case Direction.SOUTH:
                return 'SOUTH';
            case Direction.WEST:
                return 'WEST';
        }
    }

    public static isSameOrbit(first: Orbit, second: Orbit): boolean {
        let isEqual = true;
        if (first.xCoordinate.coordinate != second.xCoordinate.coordinate) {
            isEqual = false;
        }
        if (first.yCoordinate.coordinate != second.yCoordinate.coordinate) {
            isEqual = false;
        }
        return isEqual;
    }

    public static round(value: number, precision: number) {
        let multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    static getNextSmallerDistanceMetric(metric: DistanceMetricEnum) {
        const factor = this.distanceMetricValues.get(metric)!;
        const find = Array.from(this.distanceMetricValues.entries())
            .sort((a, b) => b[1] - a[1])
            .find(value => value[1] < factor);
        if (!!find) {
            return find[0];
        }
        return metric;
    }
}
