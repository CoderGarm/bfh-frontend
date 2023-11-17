import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EEducationType, EnumValueDto, PlanetApiService} from "../../../../../services/swagger";
import {TypeService} from "../../../../../services/type.service";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {Amount, CarrierAmount, ResourceFetchOrder} from "../transport-resources/transport-resources.component";
import EDepositTypeEnum = EnumValueDto.EDepositTypeEnum;

@Component({
    selector: 'app-humans-carrier',
    templateUrl: './humans-carrier.component.html',
    styleUrls: ['./humans-carrier.component.scss']
})
export class HumansCarrierComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    resourceFetchOrder?: ResourceFetchOrder;

    @Output()
    change: EventEmitter<CarrierAmount> = new EventEmitter();

    titleKey: string = 'demand';

    resources: EEducationType[] = [];

    militaries: EEducationType[] = [];

    amounts: Map<string, number> = new Map<string, number>();

    constructor(private typeService: TypeService,
                private planetService: PlanetApiService) {
        super();

        let sub = this.typeService.educationTypes.subscribe(d => {
            this.resources = d;
            this.resources.forEach(resource => {
                if (resource.isMilitary) {
                    this.militaries.push(resource);
                }
            });
        });
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!!this.resourceFetchOrder) {
            this.titleKey = this.resourceFetchOrder.type.split('_')[1].toLowerCase();
            this.fetchData();
        }
    }

    private fetchData() {
        if (!!this.resourceFetchOrder) {
            if (this.resourceFetchOrder.type === EDepositTypeEnum.TRANSPORTATION_DEMAND) {
                let sub = this.planetService.getTransportationDemand(this.resourceFetchOrder.planet.idPlanet)
                    .subscribe(resp => resp.humanResources.forEach(res => this.amounts.set(res.resourceType.typeName, res.amount)));
                this.subscriptions.push(sub);
            }

            if (this.resourceFetchOrder.type === EDepositTypeEnum.TRANSPORTATION_DELIVERY) {
                let sub = this.planetService.getTransportationDelivery(this.resourceFetchOrder.planet.idPlanet)
                    .subscribe(resp => resp.humanResources.forEach(res => this.amounts.set(res.resourceType.typeName, res.amount)));
                this.subscriptions.push(sub);
            }
        }
    }

    ngOnInit(): void {
    }

    submit() {
        if (!!this.resourceFetchOrder) {
            const values: Amount[] = [];
            this.amounts.forEach((amount, typeName) => values.push({resourceType: typeName, amount: amount}));
            this.change.emit({
                idPlanet: this.resourceFetchOrder.planet.idPlanet,
                transportations: values
            });
        }
    }
}
