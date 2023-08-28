import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EResourceType, HumanResourceAmount, Planet, PlanetApiService, ResourceAmount} from "../../../../../services/swagger";
import {TypeService} from "../../../../../services/type.service";
import {SubscriptionManager} from "../../../../../subscription.manager";

export interface PlanetaryResourceTransportation {
    idPlanet: number;
    transportations: Amount[];
}

export interface Amount {
    resourceType: string;
    amount: number;
}

@Component({
    selector: 'app-transportation-resource-demand',
    templateUrl: './transportation-resource-demand.component.html',
    styleUrls: ['./transportation-resource-demand.component.scss']
})
export class TransportationResourceDemandComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    planet?: Planet;

    @Output()
    demandEmitter: EventEmitter<PlanetaryResourceTransportation> = new EventEmitter();

    resources: EResourceType[];

    collectables: EResourceType[] = [];

    amounts: Amount[] = [];

    constructor(private typeService: TypeService,
                private planetService: PlanetApiService) {
        super();
        this.resources = this.typeService.eResourceTypes;
        this.resources.forEach(resource => {
            if (resource.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE) {
                this.collectables.push(resource);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['planet']) {
            if (!!this.planet) {
                let sub = this.planetService.getTransportationDemand(this.planet.idPlanet).subscribe(resp => resp.resources.forEach(res => this.setAmount(res)));
                this.subscriptions.push(sub);
            }
        }
    }

    ngOnInit(): void {
    }

    submit() {
        if (!!this.planet) {
            this.demandEmitter.emit({
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

    getStartAt(resource: EResourceType) {
        const exists = this.amounts.filter(r => r.resourceType === resource.typeName);
        if (exists.length != 0) {
            return exists[0].amount;
        }
        return 0;
    }
}
