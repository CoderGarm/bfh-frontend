import {AlignedFitting, BaseModule, EnumValueDto, Launcher, Mass, ShipClass, ShipClassMock, Weapon} from "../../../../services/swagger";
import {NavigationCalculator} from "../../../../services/helper/navigation-calculator.helper";
import EMassMetricsEnum = EnumValueDto.EMassMetricsEnum;

export class ShipClassHelper {

    /**
     * Returns the pure mass without the geometric correction of the backend calculation.
     */
    public static getMassWithoutCorrection(o1: ShipClass | ShipClassMock): Mass {
        let sum = 0;
        const massMetric = EMassMetricsEnum.T;
        if (!!o1.propulsion.baseModule.tonnage) {
            sum += NavigationCalculator.convertMassToMetric(o1.propulsion.baseModule.tonnage, massMetric);
        }
        if (!!o1.armor && !!o1.armor.baseModule.tonnage) {
            sum += NavigationCalculator.convertMassToMetric(o1.armor.baseModule.tonnage, massMetric);
        }
        if (!!o1.sidewall && !!o1.sidewall.baseModule.tonnage) {
            sum += NavigationCalculator.convertMassToMetric(o1.sidewall.baseModule.tonnage, massMetric);
        }
        if (!!o1.electronicWarfare && !!o1.electronicWarfare.baseModule.tonnage) {
            sum += NavigationCalculator.convertMassToMetric(o1.electronicWarfare.baseModule.tonnage, massMetric);
        }
        o1.fittings.forEach(f => {
            const tonnage = !!f.weapon ? f.weapon.baseModule.tonnage : f.launcher?.baseModule.tonnage;
            if (!!tonnage) {
                const mass = {coordinate: tonnage.coordinate * f.amount, massMetric: tonnage.massMetric};
                sum += NavigationCalculator.convertMassToMetric(mass, massMetric);
            }
        });
        o1.ammunitionFittings.forEach(f => {
            const tonnage = f.missile.tonnage;
            if (!!tonnage) {
                const mass = {coordinate: tonnage.coordinate * f.amount, massMetric: tonnage.massMetric};
                sum += NavigationCalculator.convertMassToMetric(mass, massMetric);
            }
        });
        o1.supportFittings.forEach(f => {
            const tonnage = f.passiveModule.baseModule.tonnage;
            if (!!tonnage) {
                const mass = {coordinate: tonnage.coordinate * f.amount, massMetric: tonnage.massMetric};
                sum += NavigationCalculator.convertMassToMetric(mass, massMetric);
            }
        });
        return {
            coordinate: sum,
            massMetric: massMetric
        };
    }

    public static generateFittingPseudoHash(o1: ShipClass | ShipClassMock): string {

        let key: string = o1.propulsion?.baseModule?.idModule + '';
        key += o1.armor?.baseModule?.idModule + '';
        key += o1.sidewall?.baseModule?.idModule + '';
        key += o1.electronicWarfare?.baseModule?.idModule + '';
        key += this.getFittingKey(o1);
        key += this.getAmmunitionFittingKey(o1);
        key += this.getSupportFittingKey(o1);
        return key;
    }

    private static getSupportFittingKey(shipClass: ShipClass | ShipClassMock): string {
        const fittings: Map<number, number> = new Map<number, number>();
        shipClass.supportFittings.sort((a, b) => this.getBaseModuleId(a.passiveModule.baseModule) < this.getBaseModuleId(b.passiveModule.baseModule) ? 1 : -1)
            .map(af => {
                let idModule = af.passiveModule.baseModule.idModule;
                let amount = af.amount;
                let o1Am = fittings.get(idModule);
                if (!o1Am) {
                    fittings.set(idModule, amount);
                } else {
                    fittings.set(idModule, amount + o1Am);
                }
            });
        let key = '';
        fittings.forEach((value, key1) => key += key1 + 's' + value);
        return key;
    }

    private static getAmmunitionFittingKey(shipClass: ShipClass | ShipClassMock): string {
        const fittings: Map<number, number> = new Map<number, number>();
        shipClass.ammunitionFittings.sort((a, b) => this.getBaseModuleId(a.missile.baseModule) < this.getBaseModuleId(b.missile.baseModule) ? 1 : -1)
            .map(af => {
                let idMissile = af.missile.baseModule.idModule;
                let amount = af.amount;
                let o1Am = fittings.get(idMissile);
                if (!o1Am) {
                    fittings.set(idMissile, amount);
                } else {
                    fittings.set(idMissile, amount + o1Am);
                }
            });
        let key = '';
        fittings.forEach((value, key1) => key += key1 + 'a' + value);
        return key;
    }

    private static getFittingKey(shipClass: ShipClass | ShipClassMock): string {
        const fittings: Map<number, number> = new Map<number, number>();
        shipClass.fittings.sort((a, b) => this.getFittingId(a) < this.getFittingId(b) ? 1 : -1)
            .map(af => {
                let weapon: Weapon | Launcher | undefined = af.weapon || af.launcher;
                if (!weapon) {
                    return;
                }
                let idModule = weapon.baseModule.idModule;
                let amount = af.amount;
                let o1Am = fittings.get(idModule);
                if (!o1Am) {
                    fittings.set(idModule, amount);
                } else {
                    fittings.set(idModule, amount + o1Am);
                }
            });
        let key = '';
        fittings.forEach((value, key1) => key += key1 + 'w' + value);
        return key;
    }

    private static getFittingId(fitting: AlignedFitting) {
        return fitting.launcher?.baseModule?.idModule + '' + fitting.weapon?.baseModule.idModule;
    }

    private static getBaseModuleId(m: BaseModule) {
        return m.idModule + '';
    }
}
