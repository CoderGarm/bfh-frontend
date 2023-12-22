import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EShipClassType, Fleet, Mass, StarSystem, WarShip} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {StarMapCommunicationService} from "../../../services/intercom/star-map-communication.service";
import {NavigationCalculator} from "../../../services/helper/navigation-calculator.helper";
import {HyperprintCalculatorHelper, MassRange, MassRangeAmount} from "../../../services/helper/hyperprint-calculator.helper";
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

    shipsByTonnage: MassRange[] = [];
    massRangeAmounts: MassRangeAmount[] = [];

    // @formatter:off
    @Input()
    get smallDisplay() { return this._smallDisplay; }
    set smallDisplay(value: any) { this._smallDisplay = coerceBooleanProperty(value); }
    _smallDisplay: boolean = false;
    // @formatter:on

    displayAsOwnFleet: boolean = true;
    displayDetails: boolean = false;

    constructor(private commService: StarMapCommunicationService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.displayAsOwnFleet = this.isOwnFleet(this.fleet) || this.isFriendlyFleet(this.fleet);
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
        if (!this.fleet || this.isOwnFleet(this.fleet)) {
            this.shipsByTonnage = [];
            return;
        }

        const shipsByTonnage: MassRange[] = [];
        const massRangeAmounts: MassRangeAmount[] = [];
        const warShips = this.fleet.ships
            .sort((a, b) => FleetFormationDisplay.diff(a.shipClass.tonnage, b.shipClass.tonnage));

        // Höchste Eloka-Punkte im System / 10 (aufgerundet) = Anzahl der individuell auflösbaren Schiffe fixme
        // Höchste Eloka-Punkte im System * Kilotonne = auflösbare individuelle Tonnage -> check

        const hyperPrintSensorValue = this.getHyperprintSensorValue(this.getSystemOfFleet());
        const resolvableSize = Math.floor(hyperPrintSensorValue / 10);
        console.log("hyperPrintSensorValue", hyperPrintSensorValue, "resolvableSize", resolvableSize)

        warShips.forEach(warShip => {
            const range: MassRange = HyperprintCalculatorHelper.getResolvedTonnage(warShip.shipClass.tonnage, hyperPrintSensorValue);
            shipsByTonnage.push(range);
            let matchingMassRange = massRangeAmounts.find(massRangeAmount => {
                return FleetFormationDisplay.matchesRangeGroup(massRangeAmount.range.low, range.low) && FleetFormationDisplay.matchesRangeGroup(massRangeAmount.range.high, range.high);
            });
            if (!matchingMassRange) {
                massRangeAmounts.push({
                    range: range,
                    amount: 1
                });
            } else {
                matchingMassRange.range.low.coordinate = Math.min(FleetFormationDisplay.getTons(matchingMassRange.range.low, MassMetricEnum.T), FleetFormationDisplay.getTons(range.low, MassMetricEnum.T));
                matchingMassRange.range.low.massMetric = MassMetricEnum.T;
                matchingMassRange.range.high.coordinate = Math.max(FleetFormationDisplay.getTons(matchingMassRange.range.high, MassMetricEnum.T), FleetFormationDisplay.getTons(range.high, MassMetricEnum.T));
                matchingMassRange.range.high.massMetric = MassMetricEnum.T;
                matchingMassRange.amount += 1;
            }
        });

        this.shipsByTonnage = shipsByTonnage.sort((a, b) => FleetFormationDisplay.diffRange(a, b));
        this.massRangeAmounts = massRangeAmounts;
    }

    private static matchesRangeGroup(o1: Mass, o2: Mass) {
        const knownMass = FleetFormationDisplay.getTons(o1, MassMetricEnum.T);
        const otherMass = FleetFormationDisplay.getTons(o2, MassMetricEnum.T);
        return Math.abs(knownMass * 0.3) >= Math.abs(otherMass - knownMass);
    }

    private static getTons(mass: Mass, targetMetric: MassMetricEnum) {
        return NavigationCalculator.convertMassToMetric(mass, targetMetric);
    }

    private static diff(o1: Mass, o2: Mass) {
        return FleetFormationDisplay.getTons(o1, MassMetricEnum.T) - FleetFormationDisplay.getTons(o2, MassMetricEnum.T);
    }

    private static diffRange(o1: MassRange, o2: MassRange) {
        return FleetFormationDisplay.diff(o1.low, o2.low) + FleetFormationDisplay.diff(o1.high, o2.high);
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
            // base detection value for present ships
            const hyperPrintSensorValue = fleetMarkers[0].hyperPrintSensorValue == 0 ? 10 : fleetMarkers[0].hyperPrintSensorValue;
            return fleetMarkers.length > 0 ? hyperPrintSensorValue : 0;
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

    protected readonly console = console;
}
