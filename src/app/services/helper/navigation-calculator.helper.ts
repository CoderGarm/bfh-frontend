import {Acceleration, Distance, Orbit} from "../swagger";
import {ArrayXY} from "@svgdotjs/svg.js";
import DistanceMetricEnum = Distance.DistanceMetricEnum;
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;

export enum Direction {
    NORTH,
    EAST,
    SOUTH,
    WEST
}

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

    static getRestrictedAngle(x1: number, y1: number, x2: number, y2: number): number {
        let dy = y2 - y1;
        let dx = x2 - x1;
        // rads to degs, range (-180, 180]
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }

    static getAngle(x1: number, y1: number, x2: number, y2: number): number {
        let theta = NavigationCalculator.getRestrictedAngle(x1, y1, x2, y2);
        if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
    }

    /**
     * Flips the y coordinate to represent the screen-is-upside-down-topic.
     */
    static getAngleFlippedY(x1: number, y1: number, x2: number, y2: number): number {
        return NavigationCalculator.getAngle(x1, -y1, x2, -y2);
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
}
