import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {EnumValueDto, Planet, PlanetApiService, ResourceDeposit} from "../../../../../services/swagger";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {MatStepper} from "@angular/material/stepper";
import EDepositTypeEnum = EnumValueDto.EDepositTypeEnum;

export interface CarrierAmount {
    idPlanet: number;
    transportations: Amount[];
}

export interface Amount {
    resourceType: string;
    amount: number;
}

export interface ResourceFetchOrder {
    planet: Planet;
    type: EDepositTypeEnum;
}

@Component({
    selector: 'app-transport-resources',
    templateUrl: './transport-resources.component.html',
    styleUrls: ['./transport-resources.component.scss']
})
export class TransportResourcesComponent extends SubscriptionManager implements OnInit {

    @Input()
    planets: Planet[] = [];

    @Input()
    depositsResources: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    @Input()
    depositsPopulation: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    carriageTypes: string[] = ['Resources', 'Personnel'];
    carriageType: string = 'Resources';

    @ViewChildren('stepper')
    private steppers?: MatStepper[];

    constructor(private planetService: PlanetApiService,
                private snackbar: SnackbarNotificationService) {
        super();
    }

    ngOnInit(): void {
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

    change() {
        if (this.carriageType === 'Resources') {
            this.steppers?.forEach(a => a.previous());
        } else {
            this.steppers?.forEach(a => a.next());
        }
    }
}
