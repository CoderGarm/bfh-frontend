import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EnumValueDto, EResourceType, Fleet, MiningFactors, OrbitalStructures, Planet, ResourceAmount, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {TypeService} from "../../../../../services/type.service";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-planetary-dashboard',
    templateUrl: './planetary-dashboard.component.html',
    styleUrls: ['./planetary-dashboard.component.scss']
})
export class PlanetaryDashboardComponent extends SubscriptionManager implements OnInit, OnChanges {

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    planet?: Planet;
    private planetDefinition = "planet";

    @Input()
    shipyardJobPossible: boolean = false;

    @Input()
    shipyardExists: boolean = false;

    @Input()
    fleetsInOrbit?: Fleet[];

    @Input()
    orbitalStructures: OrbitalStructures[] = [];

    @Input()
    sumOfPops: number = 0;

    @Input()
    deposit?: ResourceDeposit;

    @Input()
    income?: ResourceDeposit;

    demand?: ResourceDeposit;

    @Input()
    utilization?: ResourceDeposit;

    @Input()
    capacity?: ResourceDeposit;

    @Input()
    miningFactors?: MiningFactors;

    miningFactorModifications: ResourceAmount[] = [];

    private resourceType: EResourceType[] = [];

    constructor(private resourceService: ResourcesApiService,
                private typeService: TypeService) {
        super();

        this.typeService.eResourceTypes.subscribe(resp => this.resourceType = resp);
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.planetDefinition]) {
            this.fetchData();
        }

        this.miningFactorModifications = [];
        const popFactorModification = this.orbitalStructures.filter(o => !!o.module.propertyDescriptor.orbitalModuleDescriptor && !!o.module.propertyDescriptor.orbitalModuleDescriptor.popFactorIncreasement)
            .map(o => o.module.propertyDescriptor.orbitalModuleDescriptor!.popFactorIncreasement!)
            .reduce((sum, current) => sum + current, 0);
        if (!!popFactorModification) {
            this.miningFactorModifications.push({resourceType: this.resourceType.filter(r => r.typeName === EResourceTypeEnum.POPULATION)[0], amount: popFactorModification});
        }

    }

    private fetchData() {
        if (!this.planet) {
            return;
        }

        let sub = this.resourceService.getResourceDemand(this.planet.idPlanet).subscribe(resp => {
            this.demand = resp;
        });
        this.subscriptions.push(sub);
    }

}
