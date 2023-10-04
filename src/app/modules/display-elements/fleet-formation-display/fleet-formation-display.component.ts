import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EShipClassType, Fleet, WarShip} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-fleet-formation-display',
    templateUrl: './fleet-formation-display.component.html',
    styleUrls: ['./fleet-formation-display.component.scss']
})
export class FleetFormationDisplay extends SubscriptionManager implements OnChanges {

    @Input()
    fleet?: Fleet;
    fleetInputDefinition: string = "fleet";

    private hullTypes: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    hullsByType: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    warShipsByType: Map<string, WarShip[]> = new Map<string, WarShip[]>();
    warShipsByTypeAndFlight: Map<string, WarShip[]> = new Map<string, WarShip[]>();

    // @formatter:off
    @Input()
    get smallDisplay() { return this._smallDisplay; }
    set smallDisplay(value: any) { this._smallDisplay = this.coerceBooleanProperty(value); }
    _smallDisplay: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetInputDefinition]) {
            this.hullTypes.clear();
            this.hullsByType.clear();
            this.warShipsByType.clear();
            this.warShipsByTypeAndFlight.clear();
            this.sortWarshipsByHull();
        }
    }

    private sortWarshipsByHull() {
        if (!!this.fleet) {
            let warShips: WarShip[] = this.fleet.ships;
            warShips.forEach(warShip => {
                this.hullTypes.set(warShip.shipClass.shipClassType.typeName, warShip.shipClass.shipClassType);
                this.addToTypeList(warShip);
                this.addToTypeAndFlightList(warShip);
            });
        }
    }

    private addToTypeAndFlightList(warShip: WarShip) {
        const key = warShip.shipClass.name + 'm' + warShip.shipClass.mark;
        let warShips: WarShip[] | undefined = this.warShipsByTypeAndFlight.get(key);
        if (!warShips) {
            warShips = [warShip];
        } else {
            warShips.push(warShip);
        }
        this.warShipsByTypeAndFlight.set(key, warShips);
    }

    private addToTypeList(warShip: WarShip) {
        let warShips: WarShip[] | undefined = this.warShipsByType.get(warShip.shipClass.name);
        if (!warShips) {
            warShips = [warShip];
        } else {
            warShips.push(warShip);
        }
        this.warShipsByType.set(warShip.shipClass.name, warShips);
    }

    getHullDescription(typeName: string): string {
        let hull = this.hullsByType.get(typeName);
        if (!!hull) {
            return hull.typeName + ' - ' + hull.description;
        }
        return "";
    }
}
