import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CarrierAmount} from "../transport-resources/transport-resources.component";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {EResourceType, PlanetAbstractId, PlanetApiService, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {TypeService} from "../../../../../services/type.service";

@Component({
    selector: 'app-planetary-resource-carrier',
    templateUrl: './planetary-resource-carrier.component.html',
    styleUrls: ['./planetary-resource-carrier.component.scss']
})
export class PlanetaryResourceCarrierComponent extends SubscriptionManager implements OnChanges {

    @Input()
    planet?: PlanetAbstractId;

    @Input()
    fetchDataIndicator: boolean = false;

    resources?: ResourceDeposit;

    resourceTypes: EResourceType[] = [];

    constructor(private planetService: PlanetApiService,
                private resourceService: ResourcesApiService,
                private snackbar: SnackbarNotificationService,
                private typeService: TypeService) {
        super();

        let sub = this.typeService.collectableResourceTypes.subscribe(d => this.resourceTypes = d);
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.requestPlanetDeposit();
    }

    private requestPlanetDeposit() {
        if (!!this.planet && this.fetchDataIndicator) {
            let sub = this.resourceService.getResourceDeposit(this.planet.idPlanet)
                .subscribe(resp => {
                    this.resources = ResourceHelper.copy(resp, this.resourceTypes, [])!;
                });
            this.subscriptions.push(sub);
        }
    }

    setDemand(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }

    setDelivery(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }

    private invalidEvent(event: CarrierAmount) {
        // don't know why, but a pointer event arrives on de-focusing the input
        return !('transportations' in event);
    }
}
