import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Fleet, FleetOrbit, Planet, PlanetApiService} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../SubscriptionManager";

@Component({
    selector: 'app-fleet-notch-display',
    templateUrl: './fleet-notch-display.component.html',
    styleUrls: ['./fleet-notch-display.component.scss']
})
export class FleetNotchDisplayComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    fleet?: Fleet;

    @Input()
    nameChangeAllowed: boolean = false;

    destination?: Planet;
    position?: Planet;

    destinationRepresentation?: string;
    orbitRepresentation?: string;

    constructor(private planetService: PlanetApiService) {
        super();
    }

    ngOnInit(): void {
    }

    getCssMarker() {
        if (this.isOwnFleet()) {
            return 'own';
        }
        return 'foreign';
    }

    isOwnFleet() {
        return !this.fleet || this.fleet.owner.idUser == this.userId;
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(): string {
        //todo amend fleet size icon
        return "assets/icons/fleets/png64x/small_fleet_c.png";
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.fetchDestination();
        this.fetchPosition();
    }

    private fetchDestination() {
        if (!!this.fleet && !!this.fleet.move && !!this.fleet.move.targetOrbit.system) {
            let idStarSystem = this.fleet.move.targetOrbit.system.idStarSystem;
            let orbit = this.fleet.move.targetOrbit.orbit;
            let sub = this.planetService.getPlanetByCoordinates(orbit!, idStarSystem)
                .subscribe(resp => {
                    this.destination = resp;
                    this.createDestinationRepresentation();
                });
            this.subscriptions.push(sub);
        }
        if (!this.destinationRepresentation) {
            this.createDestinationRepresentation();
        }
    }

    private fetchPosition() {
        if (!!this.fleet && !!this.fleet.orbit) {
            const fleetOrbit: FleetOrbit | undefined = this.fleet.orbit;
            if (!!fleetOrbit && !!fleetOrbit.orbit && !!fleetOrbit.system) {
                let idStarSystem = fleetOrbit.system.idStarSystem;
                let orbit = fleetOrbit.orbit;
                let sub = this.planetService.getPlanetByCoordinates(orbit!, idStarSystem)
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

    private createDestinationRepresentation() {
        let destination = "";
        if (!!this.fleet && !!this.fleet.move) {
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
