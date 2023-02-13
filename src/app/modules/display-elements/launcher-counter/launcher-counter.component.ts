import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AlignedFitting, AmmunitionModule, Launcher, Missile} from "../../../services/swagger";
import {WeaponsSelection} from "../weapons-counter/weapons-counter.component";
import {WeaponHelper} from "../../../services/helper/weapon.helper";

@Component({
    selector: 'app-launcher-counter',
    templateUrl: './launcher-counter.component.html',
    styleUrls: ['./launcher-counter.component.scss']
})
export class LauncherCounterComponent implements OnInit, OnChanges {

    /**
     * the base start amount if not changes
     */
    @Input()
    startAt?: WeaponsSelection;
    startAtDefinition: string = "startAt";

    /**
     * the current weapon selection
     */
    @Output()
    weaponSelectionOutput: EventEmitter<WeaponsSelection> = new EventEmitter<WeaponsSelection>();

    /**
     * defines the minimum value
     */
    @Input()
    min: number = 0;

    /**
     * defines the maximum value
     */
    @Input()
    max: number = Number.MAX_VALUE;

    /**
     * the ammunition module to display
     */
    ammunitionModule?: AmmunitionModule;

    /**
     * the weapon to display
     */
    weapon?: Launcher;

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.startAtDefinition]) {
            if (!!this.startAt) {
                if (WeaponHelper.isWeapon(this.startAt.weapon)) {
                    return;
                }
                this.ammunitionModule = this.startAt.ammo;
                this.weapon = <Launcher>this.startAt.weapon;
                this.startAt.weapon.alignmentTypes.forEach(key => {
                    let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
                    let amount = this.startAt!.weaponAmountPerAlignment.get(alignment);
                    if (!amount) {
                        amount = 0;
                    }
                    this.setAmount(key, amount);
                });
                if (!!this.startAt.ammoAmount) {
                    this.setAmmoAmount(this.startAt.ammoAmount);
                } else {
                    this.setAmmoAmount(0);
                }
            } else {
                this.setAmount('STERN', 0);
                this.setAmount('BROADSIDE', 0);
                this.setAmount('BOW', 0);
                this.setAmmoAmount(0);
            }
        }
    }

    ngOnInit(): void {
    }

    /**
     * sets the amount and emits it
     * @param alignmentString
     * @param amount
     */
    setAmount(alignmentString: string, amount: number) {
        let alignment = alignmentString as keyof typeof AlignedFitting.WeaponAlignmentEnum;
        if (!!this.startAt) {
            this.startAt.weaponAmountPerAlignment.set(alignment, amount);
            this.weaponSelectionOutput.emit(this.startAt);
        }
    }

    /**
     * sets the amount of ammunition modules
     * @param event
     */
    setAmmoAmount(event: number) {
        if (!!this.startAt) {
            this.startAt.ammoAmount = event;
            this.weaponSelectionOutput.emit(this.startAt);
        }
    }

    /**
     * returns the amount of weapons per alignment
     * @param alignmentString
     */
    getAmountByAlignment(alignmentString: string) {
        let alignment = alignmentString as keyof typeof AlignedFitting.WeaponAlignmentEnum;
        let amount = 0;
        if (!!this.startAt) {
            let amountBy = this.startAt.weaponAmountPerAlignment.get(alignment);
            if (!!amountBy) {
                amount = amountBy
            }
        }
        return amount;
    }

    /**
     * returns the amount of ammo modules
     */
    getAmmoAmount() {
        let amount = 0;
        if (!!this.startAt) {
            if (!!this.startAt.ammoAmount) {
                amount = this.startAt.ammoAmount;
            }
        }
        return amount;
    }

    /**
     * returns if the given weapon supports the given alignment
     * @param alignmentString
     */
    supportsAlignment(alignmentString: string) {
        if (!!this.startAt) {
            let alignment = alignmentString as keyof typeof AlignedFitting.WeaponAlignmentEnum;
            return !this.startAt.weapon.alignmentTypes.includes(alignment);
        }
        return false;
    }

    getRange(missile: Missile): number {
        return WeaponHelper.getMissileRange(missile);
    }
}
