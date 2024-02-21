import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {EEducationType, EResourceType, PlanetAbstractId, PlanetApiService, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {TypeService} from "../../../../../services/type.service";
import {TransportMainViewComponent} from "../../../orga/transport-tab-view/transport-main-view.component";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {CarrierAmount} from "../transport-resources/transport-resources.component";

@Component({
    selector: 'app-planetary-human-carrier',
    templateUrl: './planetary-human-carrier.component.html',
    styleUrls: ['./planetary-human-carrier.component.scss']
})
export class PlanetaryHumanCarrierComponent extends SubscriptionManager implements OnChanges {

    @Input()
    planet?: PlanetAbstractId;

    @Input()
    fetchDataIndicator: boolean = false;

    population?: ResourceDeposit;

    resourceTypes: EResourceType[] = [];
    educationTypes: EEducationType[] = [];

    constructor(private planetService: PlanetApiService,
                private resourceService: ResourcesApiService,
                private snackbar: SnackbarNotificationService,
                private typeService: TypeService) {
        super();

        let subject = this.typeService.militaryEducationTypes;
        if (TransportMainViewComponent.ALLOW_CIVIL_MIGRATION) {
            subject = this.typeService.educationTypes;
        }
        let sub = subject.subscribe(d => this.educationTypes = d);
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.requestPlanetDeposit();
    }

    private requestPlanetDeposit() {
        if (!!this.planet && this.fetchDataIndicator) {
            let sub = this.resourceService.getResourceDeposit(this.planet.idPlanet)
                .subscribe(resp => {
                    this.population = ResourceHelper.copy(resp, [], this.educationTypes)!;
                });
            this.subscriptions.push(sub);
        }
    }


    private invalidEvent(event: CarrierAmount) {
        // don't know why, but a pointer event arrives on de-focusing the input
        return !('transportations' in event);
    }

    setHumanDemand(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }

    setHumanDelivery(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }
}
