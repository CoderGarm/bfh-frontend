export class NavigationCalculator {

    /**
     * Calculates the distance for the given time and acceleration.
     *
     * @param time the endurance of the acceleration in s
     * @param acceleration the acceleration in m/s²
     */
    static getRangeByTimeAndAcceleration(time: number, acceleration: number): number {
        let squaredTime = Math.pow(time, 2);
        return 0.5 * acceleration * squaredTime;
    }
}
