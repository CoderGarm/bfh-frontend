import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AlignedFitting, AmmunitionModule, Launcher, Weapon} from "../../../services/swagger";
import {WeaponHelper} from "../../../services/helper/weapon.helper";

export interface WeaponsSelection {
    weapon: Weapon | Launcher,
    weaponAmountPerAlignment: Map<AlignedFitting.WeaponAlignmentEnum, number>,
    ammo?: AmmunitionModule,
    ammoAmount?: number
}

@Component({
    selector: 'app-weapons-counter',
    templateUrl: './weapons-counter.component.html',
    styleUrls: ['./weapons-counter.component.scss']
})
export class WeaponsCounterComponent implements OnInit, OnChanges {

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
     * the weapon to display
     */
    weapon?: Weapon;

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.startAtDefinition]) {
            if (!!this.startAt) {
                if (WeaponHelper.isLauncher(this.startAt.weapon)) {
                    return;
                }
                this.weapon = <Weapon>this.startAt.weapon;
                this.startAt.weapon.alignmentTypes.forEach(key => {
                    let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
                    let amount = this.startAt!.weaponAmountPerAlignment.get(alignment);
                    if (!amount) {
                        amount = 0;
                    }
                    this.setAmount(key, amount);
                });
            } else {
                this.setAmount('STERN', 0);
                this.setAmount('BROADSIDE', 0);
                this.setAmount('BOW', 0);
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
}
