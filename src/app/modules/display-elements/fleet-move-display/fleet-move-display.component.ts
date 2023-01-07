import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetOrbit, Planet, PlanetApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
    selector: 'app-fleet-move-display',
    templateUrl: './fleet-move-display.component.html',
    styleUrls: ['./fleet-move-display.component.scss']
})
export class FleetMoveDisplayComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    fleet?: Fleet;
    fleetInputDefinition: string = "fleet";

    @Input()
    showTitle: boolean = true;

    destination?: Planet;
    position?: Planet;

    destinationRepresentation: string = "";
    orbitRepresentation?: string;

    constructor(private planetApi: PlanetApiService) {
        super();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetInputDefinition]) {
            this.fetchDestination();
            this.fetchPosition();
        }
    }

    private fetchDestination() {
        if (!!this.fleet && !!this.fleet.move && !!this.fleet.move.targetOrbit.system) {
            let idStarSystem = this.fleet.move.targetOrbit.system.idStarSystem;
            let orbit = this.fleet.move.targetOrbit.orbit;
            let sub = this.planetApi.getPlanetByCoordinates(orbit!, idStarSystem)
                .subscribe(resp => {
                    this.destination = resp;
                    this.createDestinationRepresentation();
                });
            this.subscriptions.push(sub);
        }
        if (this.destinationRepresentation.length == 0) {
            this.createDestinationRepresentation();
        }
    }

    private fetchPosition() {
        if (!!this.fleet && !!this.fleet.orbit) {
            const fleetOrbit: FleetOrbit | undefined = this.fleet.orbit;
            if (!!fleetOrbit && !!fleetOrbit.orbit && !!fleetOrbit.system) {
                let idStarSystem = fleetOrbit.system.idStarSystem;
                let orbit = fleetOrbit.orbit;
                let sub = this.planetApi.getPlanetByCoordinates(orbit!, idStarSystem)
                    .subscribe(resp => {
                        this.position = resp;
                        this.createOrbitRepresentation();
                    });
                this.subscriptions.push(sub);
            }
        }
        if (!this.orbitRepresentation) {
            this.createOrbitRepresentation();
        }
    }

    getTicksLeft() {
        return this.fleet!.move!.originalDuration - this.fleet!.move!.moveDoneAtZero;
    }

    private createDestinationRepresentation() {
        let destination = "";
        if (!!this.fleet && !!this.fleet.move && this.isOwnFleet(this.fleet)) {
            if (!!this.destination) {
                destination += this.destination.name;
            } else if (!!this.fleet.move.targetOrbit.orbit) {
                destination += 'hyperlimit';
            }
            if (!!this.fleet.move.targetOrbit.system) {
                if (destination.length > 0) {
                    destination += ", ";
                }
                destination += this.fleet.move.targetOrbit.system.name;
            }
            if (!!this.fleet.move) {
                destination += ', ' + this.fleet.move.moveDoneAtZero + ' ticks';
            }
        }
        this.destinationRepresentation = destination;
    }

    private createOrbitRepresentation() {
        if (!!this.fleet && !!this.fleet.orbit) {
            let destination = "";
            if (!!this.position) {
                destination += this.position.name;
            } else {
                destination += 'hyperlimit';
            }

            const orbit: FleetOrbit = this.fleet.orbit;
            if (!!orbit) {
                if (destination.length > 0) {
                    destination += ", ";
                }
                destination += orbit.system!.name;
            }

            this.orbitRepresentation = destination;
        } else {
            this.orbitRepresentation = undefined;
        }
    }
}
