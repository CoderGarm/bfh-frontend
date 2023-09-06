import {SubscriptionManager} from "../../../../../subscription.manager";
import {EChartsOption, SeriesOption} from "echarts";
import {ThemeOption} from "ngx-echarts";
import {EResourceType, ValueTradesByTick} from "../../../../../services/swagger";

export class PriceChartHelper extends SubscriptionManager {

    protected readonly historizedTickAmount: number = 10;

    amountHistoryOpt: EChartsOption = {};
    amountMergeOpt: EChartsOption = {};

    priceHistoryOpt: EChartsOption = {};
    priceMergeOpt: EChartsOption = {};

    theme: string | ThemeOption = 'dark';

    translations: Map<string, string> = new Map<string, string>();

    constructor() {
        super();
    }

    protected createPriceChart(resourceTypes: EResourceType[], ticks: string[]) {
        this.amountHistoryOpt = {
            title: {
                text: this.translations.get('planetary.marketplace.history.amount.title')
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
        this.priceHistoryOpt = {
            title: {
                text: this.translations.get('planetary.marketplace.history.price.title')
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

    protected setPriceHistory(resourceTypes: EResourceType[],
                              history: ValueTradesByTick[]) {

        this.amountMergeOpt.series = resourceTypes.map(r => {
            const data: number[] = [];
            history.sort((a, b) => a.tick.tickNo - b.tick.tickNo).forEach(h => {
                const trades = h.trades.filter(h => h.resourceAmount.resourceType.typeName === r.typeName);
                const amount = trades.map(t => t.resourceAmount.amount).reduce((sum, current) => sum + current, 0);
                data.push(amount);
            });

            return <SeriesOption>{
                name: r.typeName,
                type: 'line',
                data: data
            }
        });
        this.priceMergeOpt.series = resourceTypes.map(r => {
            const data: number[] = [];
            const sortedTradesByTicks = history.sort((a, b) => a.tick.tickNo - b.tick.tickNo);
            sortedTradesByTicks.forEach(h => {
                let trades = h.trades.filter(h => h.resourceAmount.resourceType.typeName === r.typeName);

                // if no trade take last price, if no last price take spot price
                if (trades.length == 0) {
                    const indexOf = sortedTradesByTicks.indexOf(h);
                    if (indexOf > 0) {
                        for (let i = 1; i < indexOf; i++) {
                            const lastH = sortedTradesByTicks[indexOf - i];
                            trades = lastH.trades.filter(h => h.resourceAmount.resourceType.typeName === r.typeName);
                            if (trades.length > 0) {
                                break;
                            }
                        }
                    }
                }
                let averagePPU = 0;
                if (trades.length > 0) {
                    const pricePerUnit = trades.map(t => t.pricePerUnit).reduce((sum, current) => sum + current, 0);
                    averagePPU = Math.floor(pricePerUnit / trades.length);
                }
                data.push(averagePPU);
            });

            return <SeriesOption>{
                name: r.typeName,
                type: 'line',
                data: data
            }
        });
    }
}
