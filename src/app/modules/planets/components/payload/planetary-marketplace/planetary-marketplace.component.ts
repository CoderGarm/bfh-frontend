import {AfterViewInit, Component, Input} from '@angular/core';
import {MarketplaceApiService, Planet, ResourcePrice} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {EChartsOption, SeriesOption} from "echarts";
import {TranslateService} from "@ngx-translate/core";
import {CurrentTickService} from "../../../../../services/intercom/current-tick.service";
import {TypeService} from "../../../../../services/type.service";
import {ThemeOption} from "ngx-echarts";

@Component({
    selector: 'app-planetary-marketplace',
    templateUrl: './planetary-marketplace.component.html',
    styleUrls: ['./planetary-marketplace.component.scss']
})
export class PlanetaryMarketplaceComponent extends SubscriptionManager implements AfterViewInit {

    translations: Map<string, string> = new Map<string, string>();

    @Input()
    planet?: Planet;

    mergeOptions: EChartsOption = {};

    chartOption: EChartsOption = {};

    theme: string | ThemeOption = 'dark';

    private createData() {
        this.chartOption = {
            title: {
                text: this.translations.get('planetary.marketplace.price-history.title')
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: this.typeService.collectableResourceTypes.map(r => r.typeName)
            },
            grid: {
                left: '8%',
                right: '8%',
                bottom: '8%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: this.ticks
            },
            yAxis: {
                type: 'value'
            },
            series: this.typeService.collectableResourceTypes.map(r => <SeriesOption>{
                name: r.typeName,
                type: 'line',
                stack: 'Total',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            })
        };
    }

    private readonly historizedTickAmount: number = 10;
    ticks: string[];

    constructor(private translate: TranslateService,
                private tickService: CurrentTickService,
                private typeService: TypeService,
                private marketService: MarketplaceApiService) {
        super();


        const ticks: string[] = [];
        const toTick = this.tickService.getCurrentTick().tickNo;
        const fromTick = toTick - (this.historizedTickAmount - 1);
        for (let i = fromTick; i <= toTick; i++) {
            ticks.push(i + '');
        }
        this.ticks = ticks;

        this.translations.set('planetary.marketplace.price-history.title', 'planetary.marketplace.price-history.title');
        let sub = this.translate.get('planetary.marketplace.price-history.title').subscribe((translated: string) => {
            this.translations.set('planetary.marketplace.price-history.title', translated);
        });
        this.subscriptions.push(sub);

        this.createData();
    }

    ngAfterViewInit() {
        let sub = this.marketService.getPrices(this.historizedTickAmount).subscribe(resp => this.setPriceHistory(resp));
        this.subscriptions.push(sub);
    }

    private setPriceHistory(history: ResourcePrice[]) {
        this.mergeOptions = {
            series: this.typeService.collectableResourceTypes.map(r => {

                const data: number[] = [];
                history.sort((a, b) => a.tick.tickNo - b.tick.tickNo).forEach(h => {
                    const resourceAmount = h.prices.filter(h => h.resourceType.typeName === r.typeName)[0];
                    data.push(!!resourceAmount ? resourceAmount.amount : 0);
                });

                return <SeriesOption>{
                    name: r.typeName,
                    type: 'line',
                    stack: 'Total',
                    data: data
                }
            })
        };
    }
}
