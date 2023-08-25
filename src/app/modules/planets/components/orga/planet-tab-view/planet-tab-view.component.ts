import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
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

    shipyardJobPossible: boolean = false;
    shipyardExists: boolean = false;

    index = 1;

    constructor(private planetApi: PlanetApiService,
                private planetsNotificationService: PlanetsEventService,
                private change: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.planetsNotificationService.getSelectedPlanetEmitter().subscribe(selected => this.fetchData(selected!));
        this.subscriptions.push(sub);
        this.change.detectChanges();
    }

    fetchData(planet: Planet) {
        this.selectedPlanet = planet;
        let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanet!.idPlanet)
            .subscribe(resp => this.shipyardJobPossible = resp);
        this.subscriptions.push(subscription);

        subscription = this.planetApi.isShipyardExistsOnPlanet(this.selectedPlanet!.idPlanet)
            .subscribe(resp => {
                this.shipyardExists = resp;
                if (!this.shipyardExists) {
                    this.index = 0;
                }
            });
        this.subscriptions.push(subscription);
    }
}
