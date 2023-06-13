import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {EnumValueDto, EResourceType, MarketplaceApiService, Planet, ResourceAmount, ResourcesApiService} from "../../../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";
import {CurrentTickService} from "../../../../../services/intercom/current-tick.service";
import {TypeService} from "../../../../../services/type.service";
import {MatChipListbox} from "@angular/material/chips";
import {PriceChartHelper} from "./price-chart.helper";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {PlanetsEventService} from "../../../planets-event.service";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-planetary-marketplace',
    templateUrl: './planetary-marketplace.component.html',
    styleUrls: ['./planetary-marketplace.component.scss']
})
export class PlanetaryMarketplaceComponent extends PriceChartHelper implements AfterViewInit, OnChanges {

    @Input()
    planet?: Planet;

    @ViewChild('resourceTypeChipList')
    resourceTypeChipList!: MatChipListbox;

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;

    @ViewChild(MatSort)
    sort!: MatSort;

    credits!: EResourceType;
    tradableResourceTypes: EResourceType[] = [];
    resourceDeposit: ResourceAmount[] = [];
    presentMoney: number = 0;

    constructor(private translate: TranslateService,
                private plantNotifService: PlanetsEventService,
                private tickService: CurrentTickService,
                private typeService: TypeService,
                private resourceApi: ResourcesApiService,
                private marketService: MarketplaceApiService) {
        super();

        this.translations.set('planetary.marketplace.price-history.title', 'planetary.marketplace.price-history.title');
        let sub = this.translate.get('planetary.marketplace.price-history.title').subscribe((translated: string) => {
            this.translations.set('planetary.marketplace.price-history.title', translated);
        });
        this.subscriptions.push(sub);

        this.setUpTradableResources();
        this.createPriceChart(this.tradableResourceTypes, this.detectTicks());
        this.plantNotifService.getOfferCreatedEmitter().subscribe(() => {
            this.fetchDeposit();
            this.fetchPriceHistory();
        });
    }

    ngAfterViewInit() {
        this.fetchPriceHistory();
    }

    private fetchPriceHistory() {
        let sub = this.marketService.getTrades(this.historizedTickAmount).subscribe(resp => this.setPriceHistory(this.tradableResourceTypes, resp));
        this.subscriptions.push(sub);
    }

    private setUpTradableResources() {
        this.credits = this.typeService.collectableResourceTypes.filter(rt => rt.typeName === EResourceTypeEnum.CREDITS)[0];
        this.tradableResourceTypes = this.typeService.collectableResourceTypes.filter(r => r.typeName != this.credits.typeName);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['planet']) {
            this.fetchDeposit();
        }
    }

    private fetchDeposit() {
        if (!this.planet) {
            return;
        }
        let sub = this.resourceApi.getResourceDeposit(this.planet.idPlanet)
            .subscribe(resp => {
                // noinspection UnnecessaryLocalVariableJS
                const collectableAmounts = resp.resources
                    .filter(r => this.tradableResourceTypes.map(rt => rt.typeName).includes(r.resourceType.typeName));
                this.resourceDeposit = collectableAmounts;
                this.presentMoney = resp.resources.filter(r => r.resourceType.typeName === this.credits.typeName)[0].amount;
            });
        this.subscriptions.push(sub);
    }

    private detectTicks(): string[] {
        const ticks: string[] = [];
        const toTick = this.tickService.getCurrentTick().tickNo;
        const fromTick = this.historizedTickAmount < toTick ? (toTick - (this.historizedTickAmount - 1)) : 1;
        for (let i = fromTick; i <= toTick; i++) {
            ticks.push(i + '');
        }
        return ticks;
    }

}
