import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {EEducationType, HumanResourceAmount, Planet, PlanetApiService, ResourceAmount} from "../../../../../services/swagger";
import {TypeService} from "../../../../../services/type.service";
import {PlanetaryHumanTransportation} from "../transportation-humans-demand/transportation-humans-demand.component";
import {Amount} from "../transportation-resource-demand/transportation-resource-demand.component";

@Component({
    selector: 'app-transportation-humans-delivery',
    templateUrl: './transportation-humans-delivery.component.html',
    styleUrls: ['./transportation-humans-delivery.component.scss']
})
export class TransportationHumansDeliveryComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    planet?: Planet;

    @Output()
    deliveryEmitter: EventEmitter<PlanetaryHumanTransportation> = new EventEmitter();

    resources: EEducationType[];

    militaries: EEducationType[] = [];

    amounts: Amount[] = [];

    constructor(private typeService: TypeService,
                private planetService: PlanetApiService) {
        super();
        this.resources = typeService.educationTypes;
        this.resources.forEach(resource => {
            if (resource.isMilitary) {
                this.militaries.push(resource);
            }
        });
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['planet']) {
            if (!!this.planet) {
                let sub = this.planetService.getTransportationDelivery(this.planet.idPlanet).subscribe(resp => resp.humanResources.forEach(res => this.setAmount(res)));
                this.subscriptions.push(sub);
            }
        }
    }

    submit() {
        if (!!this.planet) {
            this.deliveryEmitter.emit({
                idPlanet: this.planet?.idPlanet,
                transportations: this.amounts
            });
        }
    }

    setAmount(event: ResourceAmount | HumanResourceAmount) {
        const exists = this.amounts.filter((r: Amount) => r.resourceType == event.resourceType.typeName);
        const item = {
            amount: event.amount,
            resourceType: event.resourceType.typeName
        };
        if (exists.length != 0) {
            const indexOf = this.amounts.indexOf(exists[0]);
            if (indexOf != -1) {
                this.amounts.splice(indexOf, 1, item);
            }
        } else {
            this.amounts.push(item);
        }
    }

    getStartAt(resource: EEducationType) {
        const exists = this.amounts.filter(r => r.resourceType === resource.typeName);
        if (exists.length != 0) {
            return exists[0].amount;
        }
        return 0;
    }
}
