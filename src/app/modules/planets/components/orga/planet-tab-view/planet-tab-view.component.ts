import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Planet, PlanetApiService} from "../../../../../services/swagger";
import {MatTabGroup} from "@angular/material/tabs";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-planet-tab-view',
    templateUrl: './planet-tab-view.component.html',
    styleUrls: ['./planet-tab-view.component.scss']
})
export class PlanetTabViewComponent extends SubscriptionManager implements OnInit {

    @ViewChild(MatTabGroup)
    matTabGroup?: MatTabGroup;

    /**
     * The user selected planet.
     */
    @Input()
    selectedPlanetInput?: Planet;

    shipyardJobPossible: boolean = false;

    constructor(private planetApi: PlanetApiService) {
        super();
    }

    ngOnInit(): void {
        let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanetInput!.idPlanet)
            .subscribe(resp => this.shipyardJobPossible = resp);
        this.subscriptions.push(subscription);
    }
}
