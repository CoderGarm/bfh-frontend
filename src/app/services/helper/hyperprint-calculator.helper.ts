import {Mass} from "../swagger";
import {NavigationCalculator} from "./navigation-calculator.helper";
import MassMetricEnum = Mass.MassMetricEnum;

export interface MassRange {
    low: Mass;
    high: Mass;
}

export interface MassRangeAmount {
    range: MassRange;
    amount: number;
}

export class HyperprintCalculatorHelper {

    static getResolvedTonnage(tonnage: Mass, hyperPrintSensorValue: number): MassRange {
        const kiloTons = Math.floor(NavigationCalculator.convertMassToMetric(tonnage, MassMetricEnum.KT));
        const sensorAccuracy = Math.floor(hyperPrintSensorValue - kiloTons);
        const deviationFactor = Math.abs(hyperPrintSensorValue / sensorAccuracy);
        let absoluteDeviation = HyperprintCalculatorHelper.randomIntFromInterval(0, kiloTons * deviationFactor);
        if (sensorAccuracy >= 0) {
            absoluteDeviation = HyperprintCalculatorHelper.randomIntFromInterval(0, kiloTons * 0.1);
        }

        console.log(
            "hyperPrintSensorValue", hyperPrintSensorValue,
            "kiloTons", kiloTons,
            "sensorAccuracy", sensorAccuracy,
            "deviationFactor", deviationFactor,
            "absoluteDeviation", absoluteDeviation
        )
        return {
            low: {coordinate: kiloTons - absoluteDeviation, massMetric: MassMetricEnum.KT},
            high: {coordinate: kiloTons + absoluteDeviation, massMetric: MassMetricEnum.KT}
        };
    }

    private static randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
