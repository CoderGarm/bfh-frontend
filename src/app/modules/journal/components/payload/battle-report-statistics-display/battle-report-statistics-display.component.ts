import {Component, Input} from '@angular/core';
import {BattleReportStatistics, Fleet, LossRole} from "../../../../../services/swagger";
import {BattleRegisterService} from "../../../../../services/intercom/battle-register.service";
import {CombatReport} from "../../../combat-report";

@Component({
    selector: 'app-battle-report-statistics-display',
    templateUrl: './battle-report-statistics-display.component.html',
    styleUrls: ['./battle-report-statistics-display.component.scss']
})
export class BattleReportStatisticsDisplayComponent {

    @Input()
    reportStatistics?: BattleReportStatistics;

    constructor(protected battleRegisterService: BattleRegisterService) {
    }

    getLosses(reportStat: BattleReportStatistics): LossRole[] {
        if (!!this.battleRegisterService.currentlyOpenedItem && this.battleRegisterService.currentlyOpenedItem.battleReportStatistics.idBattleReport == reportStat.idBattleReport) {
            return this.battleRegisterService.currentlyOpenedItem.lossRole;
        }
        return [];
    }

    getFleets(reportStat: BattleReportStatistics): Fleet[] {
        if (!!this.battleRegisterService.currentlyOpenedItem && this.battleRegisterService.currentlyOpenedItem.battleReportStatistics.idBattleReport == reportStat.idBattleReport) {
            return this.battleRegisterService.currentlyOpenedItem.participatingFleets;
        }
        return [];
    }


    showOverlay(report: BattleReportStatistics, loss: LossRole) {
        if (!!this.battleRegisterService.currentlyOpenedItem && this.battleRegisterService.currentlyOpenedItem.battleReportStatistics.idBattleReport == report.idBattleReport) {
            this.battleRegisterService.lossReport = new CombatReport(this.battleRegisterService.currentlyOpenedItem, loss);
        }
    }


    checkDisplayOverlay(report: BattleReportStatistics, loss: LossRole) {
        const reportIsForSelectedLoss = !!this.battleRegisterService.lossReport && loss.warShipName === this.battleRegisterService.lossReport.lossRole.warShipName;
        const openedAccordionMatchesReport = this.battleRegisterService.currentlyOpenedItemIndex == this.battleRegisterService.battleReports.indexOf(report);
        return openedAccordionMatchesReport && reportIsForSelectedLoss;
    }
}
