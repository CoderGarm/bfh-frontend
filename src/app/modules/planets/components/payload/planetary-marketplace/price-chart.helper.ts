import {SubscriptionManager} from "../../../../../subscription.manager";
import {EChartsOption, SeriesOption} from "echarts";
import {ThemeOption} from "ngx-echarts";
import {EResourceType, TradesByTick} from "../../../../../services/swagger";

export class PriceChartHelper extends SubscriptionManager {

    protected readonly historizedTickAmount: number = 10;

    mergeOptions: EChartsOption = {};

    chartOption: EChartsOption = {};

    theme: string | ThemeOption = 'dark';

    translations: Map<string, string> = new Map<string, string>();

    constructor() {
        super();
    }

    protected createPriceChart(resourceTypes: EResourceType[], ticks: string[]) {
        this.chartOption = {
            title: {
                text: this.translations.get('planetary.marketplace.price-history.title')
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: resourceTypes.map(r => r.typeName)
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
                data: ticks
            },
            yAxis: {
                type: 'value'
            },
            series: resourceTypes.map(r => <SeriesOption>{
                name: r.typeName,
                type: 'line',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            })
        };
    }

    protected setPriceHistory(resourceTypes: EResourceType[], history: TradesByTick[]) {
        this.mergeOptions = {
            series: resourceTypes.map(r => {

                const data: number[] = [];
                history.sort((a, b) => a.tick.tickNo - b.tick.tickNo).forEach(h => {
                    const trades = h.trades.filter(h => h.resourceAmount.resourceType.typeName === r.typeName);
                    const amount = trades.map(t => t.resourceAmount.amount).reduce((sum, current) => sum + current, 0);
                    const pricePerUnit = trades.map(t => t.pricePerUnit).reduce((sum, current) => sum + current, 0);
                    data.push(amount);
                    //data.push(Math.floor(pricePerUnit / amount)); /* fixme set price history */
                });

                return <SeriesOption>{
                    name: r.typeName,
                    type: 'line',
                    data: data
                }
            })
        };
    }
}
