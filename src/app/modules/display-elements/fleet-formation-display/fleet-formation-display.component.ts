import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EHullType, Fleet, Hull, WarShip} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-fleet-formation-display',
    templateUrl: './fleet-formation-display.component.html',
    styleUrls: ['./fleet-formation-display.component.scss']
})
export class FleetFormationDisplay extends SubscriptionManager implements OnInit, OnChanges {

    /**
     * the fleet to display
     */
    @Input()
    fleet?: Fleet;
    fleetInputDefinition: string = "fleet";

    private hullTypes: Map<string, EHullType> = new Map<string, EHullType>();
    hullsByType: Map<string, Hull> = new Map<string, Hull>();
    warShipsByType: Map<string, WarShip[]> = new Map<string, WarShip[]>();

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetInputDefinition]) {
            this.hullTypes.clear();
            this.hullsByType.clear();
            this.warShipsByType.clear();
            this.sortWarshipsByHull();
        }
    }

    private sortWarshipsByHull() {
        if (!!this.fleet) {
            let warShips: WarShip[] = this.fleet.ships;
            warShips.forEach(warShip => {
                let hullType = warShip.shipClass.hull.hullType;
                const typeName = hullType.typeName;
                this.hullTypes.set(typeName, hullType);

                let warShips: WarShip[] | undefined = this.warShipsByType.get(warShip.shipClass.name);
                if (!warShips) {
                    this.hullsByType.set(typeName, warShip.shipClass.hull);
                    warShips = [warShip];
                } else {
                    warShips.push(warShip);
                }
                this.warShipsByType.set(warShip.shipClass.name, warShips);
            });
        }
    }

    getHullDescription(typeName: string): string {
        let hull = this.hullsByType.get(typeName);
        if (!!hull) {
            return hull.hullType.typeName + ' - ' + hull.description;
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
