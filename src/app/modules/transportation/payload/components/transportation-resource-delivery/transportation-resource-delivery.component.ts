import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EResourceType, Planet, PlanetApiService, ResourceAmount} from "../../../../../services/swagger";
import {TypeService} from "../../../../../services/type.service";
import {PlanetaryResourceTransportation} from "../transportation-resource-demand/transportation-resource-demand.component";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-transportation-resource-delivery',
    templateUrl: './transportation-resource-delivery.component.html',
    styleUrls: ['./transportation-resource-delivery.component.scss']
})
export class TransportationResourceDeliveryComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    planet?: Planet;

    @Output()
    deliveryEmitter: EventEmitter<PlanetaryResourceTransportation> = new EventEmitter();

    resources: EResourceType[];

    collectables: EResourceType[] = [];

    amounts: ResourceAmount[] = [];

    constructor(private typeService: TypeService,
                private planetService: PlanetApiService) {
        super();
        this.resources = typeService.eResourceTypes;
        this.resources.forEach(resource => {
            if (resource.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE) {
                this.collectables.push(resource);
            }
        });
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['planet']) {
            if (!!this.planet) {
                let sub = this.planetService.getTransportationDelivery(this.planet.idPlanet).subscribe(resp => resp.resources.forEach(res => this.setAmount(res)));
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

    setAmount(event: ResourceAmount) {
        const exists = this.amounts.filter(r => r.resourceType.typeName == event.resourceType.typeName);
        if (exists.length != 0) {
            const indexOf = this.amounts.indexOf(exists[0]);
            if (indexOf != -1) {
                this.amounts.splice(indexOf, 1, event);
            }
        } else {
            this.amounts.push(event);
        }
    }

    getStartAt(resource: EResourceType) {
        const exists = this.amounts.filter(r => r.resourceType.typeName === resource.typeName);
        if (exists.length != 0) {
            return exists[0].amount;
        }
        return 0;
    }
}
