import {Component, Input, OnInit} from '@angular/core';
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

    setDemand(event: PlanetaryHumanTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(() => this.snackbar.open('Yeah, demand is placed'));
        this.subscriptions.push(sub);
    }

    setDelivery(event: PlanetaryHumanTransportation) {
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(() => this.snackbar.open('Yeah, delivery is placed'));
        this.subscriptions.push(sub);
    }
}
