import {SubscriptionManager} from "../../../../../subscription.manager";
import {EChartsOption} from "echarts";
import {CombatArenaData} from "../../../combat-arena-data";

export class ActionChartHelper extends SubscriptionManager {

    options: EChartsOption = {};

    translations: Map<string, string> = new Map<string, string>();

    constructor() {
        super();
    }

    protected createActionChart(combatArenaData: CombatArenaData) {

        const data = combatArenaData.combatRounds.map(round => {
            let amountOfActions = 0;
            amountOfActions += combatArenaData.movementsByRound.has(round) ? combatArenaData.movementsByRound.get(round)!.length : 0;
            amountOfActions += combatArenaData.missileMovementsByRound.has(round) ? combatArenaData.missileMovementsByRound.get(round)!.length : 0;
            amountOfActions += combatArenaData.shipKillerHitsByRound.has(round) ? combatArenaData.shipKillerHitsByRound.get(round)!.length : 0;
            amountOfActions += combatArenaData.counterMissileHitsByRound.has(round) ? combatArenaData.counterMissileHitsByRound.get(round)!.length : 0;
            amountOfActions += combatArenaData.volleysByRound.has(round) ? combatArenaData.volleysByRound.get(round)!.length : 0;
            amountOfActions += combatArenaData.hitLogsByRound.has(round) ? combatArenaData.hitLogsByRound.get(round)!.length : 0;
            return amountOfActions;
        });

        this.options = {
            xAxis: {
                type: 'category',
                data: combatArenaData.combatRounds,
                boundaryGap: false,
                show: false
            },
            yAxis: {
                type: 'value',
                boundaryGap: false,
                show: false
            },
            grid: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            },
            series: [
                {
                    data: data,
                    type: 'line',
                    smooth: true,
                    selectedMode: "multiple",
                    areaStyle: {}
                }
            ]
        };
    }
}
