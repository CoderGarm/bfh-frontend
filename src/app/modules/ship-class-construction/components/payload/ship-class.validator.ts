import {ShipClass, ShipClassMock} from "../../../../services/swagger";
import {ShipClassNamePatternValidatorDirective} from "../../../../validators/shipName-pattern.validator";

export class ShipClassValidator {

    public static isValid(shipClass?: ShipClass | ShipClassMock): boolean {

        if (!shipClass) {
            return false;
        }

        const name = shipClass.name;
        if (!name) {
            return false;
        }

        const matchRegex = ShipClassNamePatternValidatorDirective.NAME_REGEX.test(name);
        if (!matchRegex) {
            return false;
        }

        return !!shipClass.shipClassType && !!shipClass.propulsion;
    }

    public static hasPayload(shipClass?: ShipClass | ShipClassMock): boolean {

        if (!shipClass) {
            return false;
        }

        let content: number = 0;
        content += shipClass.fittings.length > 0 ? 1 : 0;
        content += shipClass.ammunitionFittings.length > 0 ? 1 : 0;
        content += shipClass.supportFittings.length > 0 ? 1 : 0;
        content += !!shipClass.propulsion ? 1 : 0;
        content += !!shipClass.armor ? 1 : 0;
        content += !!shipClass.electronicWarfare ? 1 : 0;
        content += !!shipClass.sidewall ? 1 : 0;
        return content > 0;
    }
}
