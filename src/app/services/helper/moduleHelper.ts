import {Acceleration, EModuleType, EnumValueDto, Launcher, Missile, Weapon} from "../swagger";
import {NavigationCalculator} from "./navigation-calculator.helper";
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;
import EModuleTypesEnum = EnumValueDto.EModuleTypesEnum;

export class ModuleHelper {

    /**
     * Checks if the selection is about a a launcher type.
     *
     * @param weapon
     */
    static isLauncher(weapon: Weapon | Launcher): boolean {
        let weaponType = weapon.weaponType;
        return weaponType === Launcher.WeaponTypeEnum.MISSILE || weaponType === Launcher.WeaponTypeEnum.COUNTER_MISSILE;

    }

    /**
     * Checks if the selection is about a a weapon type.
     *
     * @param weapon
     */
    static isWeapon(weapon: Weapon | Launcher): boolean {
        let weaponType = weapon.weaponType;
        return weaponType === Weapon.WeaponTypeEnum.BEAM || weaponType === Weapon.WeaponTypeEnum.POINT_DEFENSE;

    }

    /**
     * Calculates the missile range in m.
     *
     * @param missile the missile
     */
    static getMissileRange(missile: Missile): number {
        let range = 0;
        let endurance = missile.missileMotor.endurance;
        let acceleration = missile.missileMotor.acceleration;
        range += NavigationCalculator.getRangeByTimeAndAcceleration(endurance, acceleration, AccelerationMetricEnum.MS2);
        return range;
    }

    static getModuleType(typeName: string): EModuleType {
        const newVar = {
            typeName: typeName,
            iconName: typeName,
            folder: "icons/stats/",
            moduleName: typeName
        };
        switch (typeName) {
            case EModuleTypesEnum.ELECTRONIC_WARFARE:
                newVar.iconName = 'scanner';
                return newVar
            default:
                throw new Error("Please implement '" + typeName + "'");
        }
    }
}
