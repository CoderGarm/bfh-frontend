import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EShipClassType, Fleet, FleetApiService, WarShip} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-fleet-formation-display',
    templateUrl: './fleet-formation-display.component.html',
    styleUrls: ['./fleet-formation-display.component.scss']
})
export class FleetFormationDisplay extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    fleet?: Fleet;
    fleetInputDefinition: string = "fleet";

    private hullTypes: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    hullsByType: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    warShipsByType: Map<string, WarShip[]> = new Map<string, WarShip[]>();

    // @formatter:off
    @Input()
    get retireAllowed() { return this._retireAllowed; }
    set retireAllowed(value: any) { this._retireAllowed = this.coerceBooleanProperty(value); }
    _retireAllowed: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    constructor(private fleetService: FleetApiService) {
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
                let hullType = warShip.shipClass.shipClassType;
                const typeName = hullType.typeName;
                this.hullTypes.set(typeName, hullType);

                let warShips: WarShip[] | undefined = this.warShipsByType.get(warShip.shipClass.name);
                if (!warShips) {
                    this.hullsByType.set(typeName, warShip.shipClass.shipClassType);
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
            return hull.typeName + ' - ' + hull.description;
        }
        return "";
    }

    retireShip(warShip: WarShip) {
        let sub = this.fleetService.retireWarship(warShip.idWarship).subscribe(resp => {
            if (resp) {
                const ship = this.fleet!.ships.filter(s => s.idWarship === warShip.idWarship);
                if (ship.length == 1) {
                    const indexOf = this.fleet!.ships.indexOf(ship[0]);
                    this.fleet!.ships.splice(indexOf, 1);

                    this.warShipsByType.forEach((ships, className) => {
                        const ship = ships.filter(s => s.idWarship === warShip.idWarship);
                        if (ship.length == 1) {
                            const indexOf = ships.indexOf(ship[0]);
                            ships.splice(indexOf, 1);
                        }
                    });
                }
            }
        });
        this.subscriptions.push(sub);
    }
}
