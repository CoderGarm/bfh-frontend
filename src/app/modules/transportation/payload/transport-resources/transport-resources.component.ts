import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {Planet, PlanetApiService, ResourceDeposit} from "../../../../services/swagger";
import {PlanetaryResourceTransportation} from "../components/transportation-resource-demand/transportation-resource-demand.component";
import {SnackbarNotificationService} from "../../../../services/snackbar-notification.service";
import {ResourceHelper} from "../../../../ResourceHelper";

@Component({
    selector: 'app-transport-resources',
    templateUrl: './transport-resources.component.html',
    styleUrls: ['./transport-resources.component.scss']
})
export class TransportResourcesComponent extends SubscriptionManager implements OnInit {

    planets: Planet[] = [];

    constructor(private planetService: PlanetApiService,
                private snackbar: SnackbarNotificationService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.planetService.getPlanetByUsers().subscribe(resp => this.planets = resp);
        this.subscriptions.push(sub);
    }

    setDemand(event: PlanetaryResourceTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(resp => this.snackbar.open('Yeah, demand is placed'));
        this.subscriptions.push(sub);
    }

    setDelivery(event: PlanetaryResourceTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(resp => this.snackbar.open('Yeah, delivery is placed'));
        this.subscriptions.push(sub);
    }
}
