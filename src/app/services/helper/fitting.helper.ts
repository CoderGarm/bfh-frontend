import {AlignedFitting, Launcher, Missile, PassiveModule, Weapon} from "../swagger";
import {WeaponHelper} from "./weapon.helper";

export class FittingHelper {

    public static getWeaponSystemMapKey(weapon: Weapon | Launcher, key?: AlignedFitting.WeaponAlignmentEnum): string {
        let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
        let id: string = "";
        if (WeaponHelper.isWeapon(weapon)) {
            id = FittingHelper.getWeaponMapKey(<Weapon>weapon, alignment);
        }
        if (WeaponHelper.isLauncher(weapon)) {
            id = FittingHelper.getLauncherMapKey(<Launcher>weapon, alignment);
        }
        if (id.length == 0) {
            throw new Error("This is neither a weapon nor a launcher: " + JSON.stringify(weapon));
        }
        return id;
    }

    /**
     * return a unique key for the map
     * @param weapon
     * @param key
     * @public
     */
    public static getWeaponMapKey(weapon: Weapon, key?: AlignedFitting.WeaponAlignmentEnum): string {
        return weapon.baseModule.idModule + "-weapon-" + (!!key ? key : '');
    }

    /**
     * return a unique key for the map
     * @param weapon
     * @param key
     * @public
     */
    public static getLauncherMapKey(weapon: Launcher, key?: AlignedFitting.WeaponAlignmentEnum): string {
        return weapon.baseModule.idModule + "-launcher-" + (!!key ? key : '');
    }

    /**
     * returns a unique key for the map
     * @param passive
     * @public
     */
    public static getAmmunitionMapKey(passive: Missile): string {
        return passive.baseModule.idModule + "-missile";
    }

    public static getAmmunitionIdFromKey(key: string): number {
        return Number.parseInt(key.split("-")[0]);
    }

    /**
     * returns a unique key for the map
     * @param passive
     * @public
     */
    public static getPassiveMapKey(passive: PassiveModule): string {
        return passive.baseModule.idModule + "-passive";
    }
}
