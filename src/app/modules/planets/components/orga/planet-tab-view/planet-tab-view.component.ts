import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {Fleet, FleetApiService, Planet, PlanetApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {PlanetsEventService} from "../../../planets-event.service";

@Component({
    selector: 'app-planet-tab-view',
    templateUrl: './planet-tab-view.component.html',
    styleUrls: ['./planet-tab-view.component.scss']
})
export class PlanetTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'planets';

    selectedPlanet?: Planet;
    fleetsInOrbit?: Fleet[];

    shipyardJobPossible: boolean = false;
    shipyardExists: boolean = false;

    index = 0;

    constructor(private planetApi: PlanetApiService,
                private planetsNotificationService: PlanetsEventService,
                private fleetApi: FleetApiService,
                private change: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.planetsNotificationService.getSelectedPlanetEmitter().subscribe(selected => {
            this.selectedPlanet = selected;
            this.fetchData();
            this.fetchFleetsInOrbit();
        });
        this.subscriptions.push(sub);
        this.change.detectChanges();
    }

    private fetchFleetsInOrbit() {
        const sub = this.fleetApi.getFleetsByPlanet(this.selectedPlanet!.idPlanet).subscribe(resp => this.fleetsInOrbit = resp);
        this.subscriptions.push(sub);
    }

    fetchData() {
        let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanet!.idPlanet)
            .subscribe(resp => this.shipyardJobPossible = resp);
        this.subscriptions.push(subscription);

        subscription = this.planetApi.isShipyardExistsOnPlanet(this.selectedPlanet!.idPlanet)
            .subscribe(resp => {
                this.shipyardExists = resp;
                if (!this.shipyardExists && this.index === 2) {
                    // switch back to planetary dash when the new planet has no yard and you was on the old yard
                    this.index = 0;
                }
            });
        this.subscriptions.push(subscription);
    }
}
