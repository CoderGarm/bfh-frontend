import {Component, Input, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {Planet, PlanetApiService, ResourceDeposit} from "../../../../../services/swagger";
import {PlanetaryResourceTransportation} from "../transportation-resource-demand/transportation-resource-demand.component";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";

@Component({
    selector: 'app-transport-resources',
    templateUrl: './transport-resources.component.html',
    styleUrls: ['./transport-resources.component.scss']
})
export class TransportResourcesComponent extends SubscriptionManager implements OnInit {

    @Input()
    planets: Planet[] = [];

    @Input()
    deposits: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    constructor(private planetService: PlanetApiService,
                private snackbar: SnackbarNotificationService) {
        super();
    }

    ngOnInit(): void {
    }

    setDemand(event: PlanetaryResourceTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(() => this.snackbar.open('Yeah, demand is placed'));
        this.subscriptions.push(sub);
    }

    setDelivery(event: PlanetaryResourceTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(() => this.snackbar.open('Yeah, delivery is placed'));
        this.subscriptions.push(sub);
    }
}
