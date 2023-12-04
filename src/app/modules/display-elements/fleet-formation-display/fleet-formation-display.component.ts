import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EShipClassType, Fleet, Mass, StarSystem, WarShip} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {StarMapCommunicationService} from "../../../services/intercom/star-map-communication.service";
import {NavigationCalculator} from "../../../services/helper/navigation-calculator.helper";
import {HyperprintCalculatorHelper} from "../../../services/helper/hyperprint-calculator.helper";
import MassMetricEnum = Mass.MassMetricEnum;

@Component({
    selector: 'app-fleet-formation-display',
    templateUrl: './fleet-formation-display.component.html',
    styleUrls: ['./fleet-formation-display.component.scss']
})
export class FleetFormationDisplay extends SubscriptionManager implements OnChanges {

    @Input()
    fleet?: Fleet;

    @Input()
    warships?: WarShip[];

    private hullTypes: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    hullsByType: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    warShipsByType: Map<string, WarShip[]> = new Map<string, WarShip[]>();
    warShipsByTypeAndFlight: Map<string, WarShip[]> = new Map<string, WarShip[]>();

    shipsByTonnage: Map<number, number> = new Map<number, number>();

    // @formatter:off
    @Input()
    get smallDisplay() { return this._smallDisplay; }
    set smallDisplay(value: any) { this._smallDisplay = coerceBooleanProperty(value); }
    _smallDisplay: boolean = false;
    // @formatter:on

    displayAsOwnFleet: boolean = true;


    constructor(private commService: StarMapCommunicationService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.displayAsOwnFleet = this.isOwnFleet(this.fleet);

        if (!!this.fleet || !!this.warships) {
            this.hullTypes.clear();
            this.hullsByType.clear();
            this.warShipsByType.clear();
            this.warShipsByTypeAndFlight.clear();
            this.sortWarshipsByHull();
            this.sortWarshipsForSensorStrength();
        }
    }

    private sortWarshipsByHull() {
        let warShips: WarShip[] | undefined = undefined;
        if (!!this.fleet) {
            warShips = this.fleet.ships;
        } else if (!!this.warships) {
            warShips = this.warships;
        }
        warShips?.forEach(warShip => {
            this.hullTypes.set(warShip.shipClass.shipClassType.typeName, warShip.shipClass.shipClassType);
            this.addToTypeList(warShip);
            this.addToTypeAndFlightList(warShip);
        });

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

    private sortWarshipsForSensorStrength() {
        if (!this.fleet) {
            this.shipsByTonnage.clear();
            return;
        }
        let hyperPrintSensorValue = this.getHyperprintSensorValue(this.getSystemOfFleet());
        /*
        - Höchste Eloka-Punkte im System / 10 (aufgerundet) = Anzahl der individuell auflösbaren Schiffe
        - Höchste Eloka-Punkte im System * Kilotonne = auflösbare individuelle Tonnage
        */

        const resolvableSize = Math.floor(this.fleet.ships.length / 10);
        const warShips = this.fleet.ships
            .sort((a, b) => FleetFormationDisplay.getTons(a.shipClass.tonnage, MassMetricEnum.T) - FleetFormationDisplay.getTons(b.shipClass.tonnage, MassMetricEnum.T));
        const resolvableLimit = (warShips.length - 1) - resolvableSize;
        for (let i = warShips.length - 1; i >= resolvableLimit; i--) {
            const warShip = warShips[i];
            const resolvedTonnage: Mass = HyperprintCalculatorHelper.getResolvedTonnage(warShip.shipClass.tonnage, hyperPrintSensorValue);
            const tons = FleetFormationDisplay.getTons(resolvedTonnage, MassMetricEnum.T);
            let amount = this.shipsByTonnage.has(tons) ? this.shipsByTonnage.get(tons)! : 0;
            this.shipsByTonnage.set(tons, ++amount);
        }
    }

    private static getTons(mass: Mass, targetMetric: MassMetricEnum) {
        return NavigationCalculator.convertMassToMetric(mass, targetMetric);
    }

    private getHyperprintSensorValue(system?: StarSystem) {
        if (!!system) {
            const fleetMarkers = this.commService.galaxyFleetDistribution.filter(fleetMarker => {
                const sameSystem = fleetMarker.orbit?.system?.idStarSystem == system?.idStarSystem;
                const origin = fleetMarker.move?.startOrbit.system;
                const destination = fleetMarker.move?.targetOrbit.system;
                const interplanetaryMove = origin?.idStarSystem == destination?.idStarSystem;
                return sameSystem || (interplanetaryMove && origin?.idStarSystem == system?.idStarSystem);
            });
            return fleetMarkers.length > 0 ? fleetMarkers[0].hyperPrintSensorValue : 0;
        }
        return 0;
    }

    private getSystemOfFleet() {
        if (!this.fleet) {
            return undefined;
        }
        let system = this.fleet.orbit?.system;
        if (!system) {
            const origin = this.fleet.move?.startOrbit.system;
            const destination = this.fleet.move?.targetOrbit.system;
            if (origin?.idStarSystem == destination?.idStarSystem) {
                system = origin;
            }
        }
        return system;
    }
}
