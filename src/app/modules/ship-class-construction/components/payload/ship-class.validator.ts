import {BaseModule, ShipClass, ShipClassMock} from "../../../../services/swagger";

export class ShipClassValidator {


    public static isValid(shipClass?: ShipClass | ShipClassMock): boolean {

        if (!shipClass) {
            return false;
        }

        const name = shipClass.name;
        if (!name || name.length >= 3 || name.length <= 30) {
            return false;
        }

        const h = shipClass.hull;
        if (!h) {
            return false;
        }
        if (!shipClass.propulsion) {
            return false;
        }

        let m = h.constructionCapacity;
        m = m - ShipClassValidator.getPropulsionCapacity(shipClass)
            - ShipClassValidator.cap(shipClass.electronicWarfare)
            - ShipClassValidator.cap(shipClass.armor)
            - ShipClassValidator.cap(shipClass.sidewall);

        shipClass.supportFittings.forEach(sf => {
            for (let i = 0; i < sf.amount; i++) {
                m -= ShipClassValidator.cap(sf.passiveModule);
            }
        });
        shipClass.ammunitionFittings.forEach(sf => {
            for (let i = 0; i < sf.amount; i++) {
                m -= ShipClassValidator.cap(sf.ammunitionModule);
            }
        });
        if (m < 0) {
            return false;
        }


        let b = h.constructionCapacityBow;
        let s = h.constructionCapacityStern;
        let bs = h.constructionCapacityBroadsides;
        shipClass.fittings.forEach(af => {
            let sum = 0;
            for (let i = 0; i < af.amount; i++) {
                sum += ShipClassValidator.cap((!!af.weapon ? af.weapon : af.launcher));
            }

            switch (af.weaponAlignment) {
                case "BOW":
                    b -= sum;
                    break;
                case "STERN":
                    s -= sum;
                    break;
                case "BROADSIDE":
                    bs -= sum;
                    break;
            }
        });
        if (b < 0) {
            return false;
        }
        if (s < 0) {
            return false;
        }
        if (bs < 0) {
            return false;
        }

        return true;
    }

    private static cap<MODULE extends { baseModule: BaseModule }>(module?: MODULE): number {
        return (!!module ? module.baseModule.useCapacity : 0);
    }

    private static getPropulsionCapacity(shipClass: ShipClass | ShipClassMock): number {
        if (!shipClass.propulsion || !shipClass.hull) {
            return 0;
        }
        return Math.floor(shipClass.propulsion.costsPercentage * shipClass.hull.constructionCapacity / 100);
    }
}
