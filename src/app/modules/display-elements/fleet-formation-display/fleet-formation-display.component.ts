import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Fleet, Hull, WarShip} from "../../../services/swagger";
import HullTypeEnum = Hull.HullTypeEnum;

@Component({
    selector: 'app-fleet-formation-display',
    templateUrl: './fleet-formation-display.component.html',
    styleUrls: ['./fleet-formation-display.component.scss']
})
export class FleetFormationDisplay implements OnInit, OnChanges {

    /**
     * the fleet to display
     */
    @Input()
    selectedFleetInput?: Fleet;
    selectedFleetInputDefinition: string = "selectedFleetInput";

    hullAmountByType: Map<Hull.HullTypeEnum, number> = new Map<Hull.HullTypeEnum, number>();

    hullsByType: Map<Hull.HullTypeEnum, Hull> = new Map<Hull.HullTypeEnum, Hull>();

    warShipsByType: Map<Hull.HullTypeEnum, WarShip[]> = new Map<Hull.HullTypeEnum, WarShip[]>();

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedFleetInputDefinition]) {
            this.hullsByType.clear();
            this.hullAmountByType.clear();
            this.warShipsByType.clear();
            if (!!this.selectedFleetInput) {
                let warShips: WarShip[] = this.selectedFleetInput.ships;
                warShips.forEach(warShip => {
                    let hullType = warShip.shipClass.hull.hullType;
                    let amount = this.hullAmountByType.get(hullType);
                    let warShips: WarShip[] | undefined = this.warShipsByType.get(hullType);
                    if (!amount) {
                        amount = 1;
                        this.hullsByType.set(hullType, warShip.shipClass.hull);
                        warShips = [warShip];
                    } else {
                        amount++;
                        warShips?.push(warShip);
                    }
                    this.warShipsByType.set(hullType, warShips!);
                    this.hullAmountByType.set(hullType, amount);
                });
            }
        }
    }

    getWarShips(key: HullTypeEnum): WarShip[] {
        let warShips = this.warShipsByType.get(key);
        if (!warShips) {
            return [];
        }
        return warShips;
    }

    getDescription(key: HullTypeEnum) {
        let hull = this.hullsByType.get(key);
        if (!!hull) {
            return hull.description;
        }
        return "";
    }

    getAmount(key: HullTypeEnum) {
        return this.hullAmountByType.get(key) || 0;
    }
}
