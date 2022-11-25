import {Component, OnInit} from '@angular/core';
import {Planet, PlanetApiService, ResourceDeposit} from "../../../../services/swagger";
import {SnackbarNotificationService} from "../../../../services/snackbar-notification.service";
import {ResourceHelper} from "../../../../ResourceHelper";
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {PlanetaryHumanTransportation} from "../components/transportation-humans-demand/transportation-humans-demand.component";

@Component({
    selector: 'app-transport-humans',
    templateUrl: './transport-humans.component.html',
    styleUrls: ['./transport-humans.component.scss']
})
export class TransportHumansComponent extends SubscriptionManager implements OnInit {

    planets: Planet[] = [];

    constructor(private planetService: PlanetApiService,
                private snackbar: SnackbarNotificationService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.planetService.getPlanetByUsers().subscribe(resp => this.planets = resp);
        this.subscriptions.push(sub);
    }

    setDemand(event: PlanetaryHumanTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(resp => this.snackbar.open('Yeah, demand is placed'));
        this.subscriptions.push(sub);
    }

    setDelivery(event: PlanetaryHumanTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(resp => this.snackbar.open('Yeah, delivery is placed'));
        this.subscriptions.push(sub);
    }
}
