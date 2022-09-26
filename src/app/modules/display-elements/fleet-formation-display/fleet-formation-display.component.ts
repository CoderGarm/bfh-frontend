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

    private hullTypes: Map<string, EHullType> = new Map<string, EHullType>();
    hullsByType: Map<string, Hull> = new Map<string, Hull>();
    warShipsByType: Map<string, WarShip[]> = new Map<string, WarShip[]>();

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedFleetInputDefinition]) {
            this.hullTypes.clear();
            this.hullsByType.clear();
            this.warShipsByType.clear();
            this.sortWarshipsByHull();
        }
    }

    private sortWarshipsByHull() {
        if (!!this.selectedFleetInput) {
            let warShips: WarShip[] = this.selectedFleetInput.ships;
            warShips.forEach(warShip => {
                let hullType = warShip.shipClass.hull.hullType;
                this.hullTypes.set(hullType.typeName, hullType);
                let warShips: WarShip[] | undefined = this.warShipsByType.get(hullType.typeName);
                if (!warShips) {
                    this.hullsByType.set(hullType.typeName, warShip.shipClass.hull);
                    warShips = [warShip];
                } else {
                    warShips?.push(warShip);
                }
                this.warShipsByType.set(hullType.typeName, warShips!);
            });
        }
    }

    getDescription(typeName: string): string {
        let hull = this.hullsByType.get(typeName);
        if (!!hull) {
            return hull.description;
        }
        return "";
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(typeName: string): string {
        const hullType = this.hullTypes.get(typeName);
        let folder = hullType!.folder;
        let iconName = hullType!.iconName;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }
}
