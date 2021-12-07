import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EHullType, Fleet, Hull, WarShip} from "../../../services/swagger";

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

    hullAmountByType: Map<EHullType, number> = new Map<EHullType, number>();

    hullsByType: Map<EHullType, Hull> = new Map<EHullType, Hull>();

    warShipsByType: Map<EHullType, WarShip[]> = new Map<EHullType, WarShip[]>();

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

    getWarShips(key: EHullType): WarShip[] {
        let warShips = this.warShipsByType.get(key);
        if (!warShips) {
            return [];
        }
        return warShips;
    }

    getDescription(key: EHullType) {
        let hull = this.hullsByType.get(key);
        if (!!hull) {
            return hull.description;
        }
        return "";
    }

    getAmount(key: EHullType) {
        return this.hullAmountByType.get(key) || 0;
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(hullType: EHullType): string {
        let folder = hullType.folder;
        let iconName = hullType.iconName;
        //todo check
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }
}
