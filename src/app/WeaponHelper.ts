import {Acceleration, Launcher, Missile, Weapon} from "./services/swagger";
import {NavigationCalculator} from "./NavigationCalculator";
import AccelerationMetricEnum = Acceleration.AccelerationMetricEnum;

export class WeaponHelper {

    /**
     * Checks if the selection is about a a launcher type.
     *
     * @param weapon
     */
    static isLauncher(weapon: Weapon | Launcher): boolean {
        let weaponType = weapon.weaponType;
        if (weaponType === Launcher.WeaponTypeEnum.MISSILE || weaponType === Launcher.WeaponTypeEnum.COUNTERMISSILE) {
            return true;
        }
        return false;
    }

    /**
     * Checks if the selection is about a a weapon type.
     *
     * @param weapon
     */
    static isWeapon(weapon: Weapon | Launcher): boolean {
        let weaponType = weapon.weaponType;
        if (weaponType === Weapon.WeaponTypeEnum.BEAM || weaponType === Weapon.WeaponTypeEnum.POINTDEFENSE) {
            return true;
        }
        return false;
    }

    /**
     * Calculates the missile range in m.
     *
     * @param missile the missile
     */
    static getMissileRange(missile: Missile): number {
        let range = 0;
        missile.missileMotors.forEach(missileMotor => {
            let endurance = missileMotor.endurance;
            let acceleration = missileMotor.acceleration;
            range += NavigationCalculator.getRangeByTimeAndAcceleration(endurance, acceleration, AccelerationMetricEnum.MS2);
        });
        return range;
    }
}
