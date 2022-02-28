import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {Fleet, Planet, PlanetApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
    selector: 'app-fleet-move-display',
    templateUrl: './fleet-move-display.component.html',
    styleUrls: ['./fleet-move-display.component.scss']
})
export class FleetMoveDisplayComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * the fleet which will take all the other war ships
     */
    @Input()
    fleetInput?: Fleet;
    fleetInputDefinition: string = "fleetInput";

    destination?: Planet;

    destinationRepresentation: string = "";

    constructor(@Optional() @Inject('fleetInput') fleet: Fleet | undefined,
                private planetApi: PlanetApiService) {
        super();
        this.fleetInput = fleet;
        this.fetchDestination();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetInputDefinition]) {
            this.fetchDestination();
        }
    }

    private fetchDestination() {
        if (!!this.fleetInput && !!this.fleetInput.move && !!this.fleetInput.move.targetOrbit.system) {
            let idStarSystem = this.fleetInput.move.targetOrbit.system.idStarSystem;
            let orbit = this.fleetInput.move.targetOrbit.orbit;
            let sub = this.planetApi.getPlanetByCoordinates(idStarSystem, orbit)
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

    getTicksLeft() {
        return this.fleetInput!.move!.originalDuration - this.fleetInput!.move!.moveDoneAtZero;
    }

    private createDestinationRepresentation() {
        let destination = "";
        if (!!this.fleetInput && !!this.fleetInput.move) {

            if (!!this.destination) {
                destination += this.destination.name;
            } else if (!!this.fleetInput.move.targetOrbit.orbit) {
                let orbit = this.fleetInput.move.targetOrbit.orbit;
                destination += orbit.xCoordinate.coordinate + ", " + orbit.yCoordinate.coordinate;
            }
            if (!!this.fleetInput.move.targetOrbit.system) {
                destination += " in " + this.fleetInput.move.targetOrbit.system.name;
            }
        }
        this.destinationRepresentation = destination;
    }
}
