import {Mass} from "../swagger";
import {NavigationCalculator} from "./navigation-calculator.helper";
import MassMetricEnum = Mass.MassMetricEnum;

export class HyperprintCalculatorHelper {

    static getResolvedTonnage(tonnage: Mass, hyperPrintSensorValue: number): Mass {
        const kiloTons = NavigationCalculator.convertMassToMetric(tonnage, MassMetricEnum.KT);
        if (hyperPrintSensorValue >= kiloTons) {
            return {coordinate: kiloTons, massMetric: MassMetricEnum.KT};
        }

        const number = this.randomIntFromInterval(kiloTons, hyperPrintSensorValue);
        return {coordinate: number, massMetric: MassMetricEnum.KT};
    }

    private static randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
