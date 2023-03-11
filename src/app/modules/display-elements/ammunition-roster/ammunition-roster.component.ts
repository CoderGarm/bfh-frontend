import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AmmunitionValue, Fleet, Missile, WarShip} from "../../../services/swagger";

export interface AmmunitionRoster {
    missile: Missile;
    amount: number;
    capacity: number;
}

@Component({
    selector: 'app-ammunition-roster',
    templateUrl: './ammunition-roster.component.html',
    styleUrls: ['./ammunition-roster.component.scss']
})
export class AmmunitionRosterComponent implements AfterViewInit, OnChanges {

    @Input()
    fleet?: Fleet;

    ammo: AmmunitionRoster[] = [];

    constructor() {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.ammo = [];
        if (!!this.fleet) {
            this.fleet.ships.forEach(warship => {
                this.addMissilesToRoster(warship);
            });
        }
    }

    private addMissilesToRoster(warship: WarShip) {
        const classLoadOut = warship.shipClass.ammunitionState;
        const ammunitionState = warship.warshipHealthState.ammunitionState;

        classLoadOut.shotsPerMissile.forEach(byClass => {

            const idMissile = byClass.missile.baseModule.idModule;
            const amountByClass: number = byClass.value;

            const current: AmmunitionValue[] = ammunitionState.shotsPerMissile.filter(a => a.missile.baseModule.idModule === idMissile);
            let amountByUsage: number = 0;
            if (current.length > 0) {
                amountByUsage = current[0].value;
            }
            const present: AmmunitionRoster[] = this.ammo.filter(a => a.missile.baseModule.idModule === idMissile);
            if (present.length == 0) {
                this.ammo.push({
                    missile: byClass.missile,
                    amount: amountByUsage,
                    capacity: amountByClass
                });
            } else {
                const existent: AmmunitionRoster = present[0];
                existent.amount += amountByUsage;
                existent.capacity += amountByClass;
            }
        });
    }
}
