import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {ResourceEmitterService} from "../../../../../services/resource-emitter.service";

@Component({
    selector: 'app-planet-tab-view',
    templateUrl: './planet-tab-view.component.html',
    styleUrls: ['./planet-tab-view.component.scss']
})
export class PlanetTabViewComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * The user selected planet.
     */
    @Input()
    selectedPlanet?: Planet;
    private selectedPlanetDefinition = "selectedPlanet";

    shipyardJobPossible: boolean = false;
    shipyardExists: boolean = false;

    constructor(private planetApi: PlanetApiService,
                private resourceEmitter: ResourceEmitterService) {
        super();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            if (!!this.selectedPlanet) {
                let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanet!.idPlanet)
                    .subscribe(resp => this.shipyardJobPossible = resp);
                this.subscriptions.push(subscription);

                subscription = this.planetApi.isShipyardExistsOnPlanet(this.selectedPlanet!.idPlanet)
                    .subscribe(resp => this.shipyardExists = resp);
                this.subscriptions.push(subscription);
            }
        }
    }

    indexChanged(event: number) {
        this.resourceEmitter.clear();
    }
}
