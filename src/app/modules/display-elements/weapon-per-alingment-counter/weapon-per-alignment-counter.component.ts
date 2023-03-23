import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {AlignedFitting, Launcher, Weapon} from "../../../services/swagger";

export interface WeaponsSelection {
    weapon: Weapon | Launcher,
    weaponAmountPerAlignment: Map<AlignedFitting.WeaponAlignmentEnum, number>,
}

@Component({
    selector: 'app-weapon-per-alignment-counter',
    templateUrl: './weapon-per-alignment-counter.component.html',
    styleUrls: ['./weapon-per-alignment-counter.component.scss']
})
export class WeaponPerAlignmentCounterComponent implements OnChanges {

    /**
     * the base start amount if not changes
     */
    @Input()
    startAt?: WeaponsSelection;

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

    weapon?: Weapon | Launcher;

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.startAt) {
            this.weapon = this.startAt.weapon;
        }
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
}
