import {Acceleration, Launcher, Missile, Weapon} from "../swagger";
import {NavigationCalculator} from "./navigation-calculator.helper";
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;

export class WeaponHelper {

    /**
     * Checks if the selection is about a a launcher type.
     *
     * @param weapon
     */
    static isLauncher(weapon: Weapon | Launcher): boolean {
        let weaponType = weapon.weaponType;
        return weaponType === Launcher.WeaponTypeEnum.MISSILE || weaponType === Launcher.WeaponTypeEnum.COUNTERMISSILE;

    }

    /**
     * Checks if the selection is about a a weapon type.
     *
     * @param weapon
     */
    static isWeapon(weapon: Weapon | Launcher): boolean {
        let weaponType = weapon.weaponType;
        return weaponType === Weapon.WeaponTypeEnum.BEAM || weaponType === Weapon.WeaponTypeEnum.POINTDEFENSE;

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
}
