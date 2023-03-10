import {Launcher, ShipClassMock, Weapon} from "../../../../services/swagger";

export class ShipClassComparator {

    /**
     * checks th the number of modules to their amount has been changed
     * @param o1
     * @param o2
     */
    public static equals(o1: ShipClassMock, o2: ShipClassMock): boolean {

        if (o1 === o2) return true

        if (o1.hull?.idHull != o2.hull?.idHull) return false;
        if (o1.propulsion != null && o2.propulsion != null ? o1.propulsion.baseModule.idModule != o2.propulsion.baseModule.idModule : o2.propulsion != null) return false;
        if (o1.armor != null && o2.armor != null ? o1.armor.baseModule.idModule != o2.armor.baseModule.idModule : o2.armor != null) return false;
        if (o1.sidewall != null && o2.sidewall != null ? o1.sidewall.baseModule.idModule != o2.sidewall.baseModule.idModule : o2.sidewall != null) return false;
        if (o1.electronicWarfare != null && o2.electronicWarfare != null ? o1.electronicWarfare.baseModule.idModule != o2.electronicWarfare.baseModule.idModule : o2.electronicWarfare != null) return false;

        if (!this.equalFittings(o1, o2)) {
            return false;
        }
        if (!this.equalAmmunitionFittings(o1, o2)) {
            return false;
        }
        return this.equalSupportFittings(o1, o2);

    }

    /**
     * checks if both fittings are the same or not
     * @param o1
     * @param o2
     * @private
     */
    private static equalSupportFittings(o1: ShipClassMock, o2: ShipClassMock): boolean {
        const o1Fittings: Map<number, number> = this.getSupportFittings(o1);
        const o2Fittings: Map<number, number> = this.getSupportFittings(o2);
        let result: boolean = true;
        o1Fittings.forEach((o1Amount, o1IdWeapon) => {
            let o2Amount = o2Fittings.get(o1IdWeapon);
            if (o2Amount != o1Amount) {
                result = false;
            }
        });
        o2Fittings.forEach((o2Amount, o2IdWeapon) => {
            let o1Amount = o1Fittings.get(o2IdWeapon);
            if (o1Amount != o2Amount) {
                result = false;
            }
        });
        return result;
    }

    /**
     * returns the idPassiveModule to their amount
     * @param shipClass
     * @private
     */
    private static getSupportFittings(shipClass: ShipClassMock): Map<number, number> {
        const fittings: Map<number, number> = new Map<number, number>();
        shipClass.supportFittings.map(af => {
            let idModule = af.passiveModule.baseModule.idModule;
            let amount = af.amount;
            let o1Am = fittings.get(idModule);
            if (!o1Am) {
                fittings.set(idModule, amount);
            } else {
                fittings.set(idModule, amount + o1Am);
            }
        });
        return fittings;
    }

    /**
     * checks if both ammunition fittings are the same or not
     * @param o1
     * @param o2
     * @private
     */
    private static equalAmmunitionFittings(o1: ShipClassMock, o2: ShipClassMock): boolean {
        const o1Fittings: Map<number, number> = this.getAmmunitionFittings(o1);
        const o2Fittings: Map<number, number> = this.getAmmunitionFittings(o2);
        let result: boolean = true;
        o1Fittings.forEach((o1Amount, o1IdWeapon) => {
            let o2Amount = o2Fittings.get(o1IdWeapon);
            if (o2Amount != o1Amount) {
                result = false;
            }
        });
        o2Fittings.forEach((o2Amount, o2IdWeapon) => {
            let o1Amount = o1Fittings.get(o2IdWeapon);
            if (o1Amount != o2Amount) {
                result = false;
            }
        });
        return result;
    }

    /**
     * returns the idAmmunitionModule  to their amount
     * @param shipClass
     * @private
     */
    private static getAmmunitionFittings(shipClass: ShipClassMock): Map<number, number> {
        const fittings: Map<number, number> = new Map<number, number>();
        shipClass.ammunitionFittings.map(af => {
            let idModule = af.ammunitionModule.baseModule.idModule;
            let amount = af.amount;
            let o1Am = fittings.get(idModule);
            if (!o1Am) {
                fittings.set(idModule, amount);
            } else {
                fittings.set(idModule, amount + o1Am);
            }
        });
        return fittings;
    }

    /**
     * checks if both fittings are the same or not
     * @param o1
     * @param o2
     * @private
     */
    private static equalFittings(o1: ShipClassMock, o2: ShipClassMock): boolean {
        const o1Fittings: Map<number, number> = this.getFittings(o1);
        const o2Fittings: Map<number, number> = this.getFittings(o2);
        let result: boolean = true;
        o1Fittings.forEach((o1Amount, o1IdWeapon) => {
            let o2Amount = o2Fittings.get(o1IdWeapon);
            if (o2Amount != o1Amount) {
                result = false;
            }
        });
        o2Fittings.forEach((o2Amount, o2IdWeapon) => {
            let o1Amount = o1Fittings.get(o2IdWeapon);
            if (o1Amount != o2Amount) {
                result = false;
            }
        });
        return result;
    }

    /**
     * returns the idWeapon to their amount
     * @param shipClass
     * @private
     */
    private static getFittings(shipClass: ShipClassMock): Map<number, number> {
        const fittings: Map<number, number> = new Map<number, number>();
        shipClass.fittings.map(af => {
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
        return fittings;
    }
}
