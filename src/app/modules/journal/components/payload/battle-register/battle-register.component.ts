import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {BattleRegisterService} from "../../../../../services/intercom/battle-register.service";
import {BattleReport, BattleReportStatistics, ReleasedVolley} from "../../../../../services/swagger";
import {CombatArenaData} from "../../../combat-arena-data";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {CombatStatistics} from "../../../combat-statistics";
import {ConnectionPositionPair} from "@angular/cdk/overlay";
import {FormControl} from "@angular/forms";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Observable, startWith} from "rxjs";
import {map} from "rxjs/operators";

@Component({
    selector: 'app-battle-register',
    templateUrl: './battle-register.component.html',
    styleUrls: ['./battle-register.component.scss']
})
export class BattleRegisterComponent extends SubscriptionManager {

    isOpen = false;

    position: ConnectionPositionPair[] = [
        new ConnectionPositionPair({originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'top'})
    ];

    coords: BattleReportStatistics[] = [];
    filteredCenter: Observable<BattleReportStatistics[]>;
    centerFormControl = new FormControl('');

    constructor(private dialogRef: MatDialogRef<BattleRegisterComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig,
                protected battleRegisterService: BattleRegisterService) {
        super();

        this.filteredCenter = this.centerFormControl.valueChanges.pipe(
            startWith(null),
            map((c: string | null) => (c ? this._filter(c) : this.coords.slice()))
        );
    }

    private _filter(value: string): BattleReportStatistics[] {
        let filterValue = '';
        try {
            filterValue = value.toLowerCase();
        } catch (e) {
            filterValue = value;
            if ('uuid' in (<any>value)) {
                filterValue = (<any>value).uuid;
                this.setOpened((<any>value));
            }
        }
        return this.battleRegisterService.battleReports!
            .filter(c => c.uuid.replaceAll('#', '').toLowerCase().includes(filterValue.replaceAll('#', '')));
    }

    private setUpCombat() {
        if (!!this.battleRegisterService.currentlyOpenedItem) {
            const ownFleetPresent = !!this.battleRegisterService.currentlyOpenedItem.participatingFleets.find(f => this.isOwnFleet(f));
            this.battleRegisterService.currentlyOpenedItem.participatingFleets.forEach(fleet => {
                if (this.isOwnFleet(fleet) || (!ownFleetPresent && !!this.battleRegisterService.red)) {
                    this.battleRegisterService.green = fleet;
                } else {
                    this.battleRegisterService.red = fleet;
                }
            });
        }
    }

    setOpened(reportStat: BattleReportStatistics) {
        this.battleRegisterService.combatRunSubscription?.unsubscribe();
        this.clear();

        let battleReport = this.battleRegisterService.battleReportsById.get(reportStat.idBattleReport);
        if (!!battleReport) {
            this.setActiveReport(battleReport);
        } else {
            this.battleRegisterService.spinnerService.activateSpinner("Battle is loading...")
            let sub = this.battleRegisterService.reportService.getReportsById(reportStat.idBattleReport).subscribe(resp => {
                this.setActiveReport(resp);
                this.battleRegisterService.spinnerService.deactivateSpinner();
            });
            this.subscriptions.push(sub);
        }
        this.battleRegisterService.starSystem = reportStat.orbit.system;
        this.battleRegisterService.currentlyOpenedItemIndex = this.battleRegisterService.battleReports.indexOf(reportStat);
    }

    private setActiveReport(report: BattleReport) {
        this.battleRegisterService.currentlyOpenedItem = report;
        this.setUpCombat();
        this.setCombatStatisticsDataSource();
        this.battleRegisterService.combatArenaData = new CombatArenaData(report);
        this.battleRegisterService.createActionChart(this.battleRegisterService.combatArenaData);
        this.battleRegisterService.activeRoundIndex = 0;
        this.battleRegisterService.setActiveRound();
        this.battleRegisterService.battleReportsById.set(report.battleReportStatistics.idBattleReport, report);
    }

    setClosed(report: BattleReportStatistics) {
        if (!!this.battleRegisterService.currentlyOpenedItem && this.battleRegisterService.currentlyOpenedItem.battleReportStatistics.idBattleReport === report.idBattleReport) {
            this.battleRegisterService.currentlyOpenedItem = undefined;
            this.battleRegisterService.currentlyOpenedItemIndex = undefined;
            this.battleRegisterService.dataSourceCombatStatistics.data = [];
            this.battleRegisterService.starSystem = undefined;
            this.battleRegisterService.red = undefined;
            this.battleRegisterService.green = undefined;
            this.clear();
        }
    }

    private clear() {
        this.battleRegisterService.combatArenaData = undefined;
    }


    private setCombatStatisticsDataSource() {
        const report = this.battleRegisterService.currentlyOpenedItem!;
        let userID = this.tokenStorage.getUserID();
        const dataByFleet: Map<number, CombatStatistics> = new Map<number, CombatStatistics>();
        report.participatingFleets.forEach(fleet =>
            dataByFleet.set(fleet.idFleet, new CombatStatistics(fleet, userID == fleet.owner.idUser))
        );
        report.shipKillerHits.forEach(hit => {
            hit.hitLogs
                .filter(h => !!h.combatRoundKey.id)
                .forEach(hitLog => {
                    let actorReport = dataByFleet.get(hit.actor.id);
                    let lossRole = hit.lossesByHit[hitLog.combatRoundKey.id!];
                    if (!!lossRole) {
                        let lossRep = dataByFleet.get(lossRole.fleet.id);
                        lossRep!.losses.add(lossRole.warship.id);
                        actorReport!.kills.add(lossRole.warship.id);
                    }
                });
        });
        report.releasedVolleys.forEach(volley => {
            let combatReport = dataByFleet.get(volley.actor.id);
            if (volley.weaponType === ReleasedVolley.WeaponTypeEnum.MISSILE) {
                combatReport!.releasedMissiles++;
            }
            if (volley.weaponType === ReleasedVolley.WeaponTypeEnum.BEAM) {
                combatReport!.releasedBeams++;
            }
        });
        this.battleRegisterService.dataSourceCombatStatistics.data = Array.from(dataByFleet.values());
    }

    selectedByAutocomplete(event?: MatAutocompleteSelectedEvent): void {
        if (!!event && this.battleRegisterService && this.battleRegisterService.currentlyOpenedItem) {
            this.setOpened(event.option.value);
        }
        if (!event && this.battleRegisterService && this.battleRegisterService.currentlyOpenedItem) {
            this.setClosed(this.battleRegisterService.currentlyOpenedItem.battleReportStatistics);
        }
        if (!!this.battleRegisterService && !!this.battleRegisterService.currentlyOpenedItem && !!this.battleRegisterService.currentlyOpenedItem.battleReportStatistics) {
            this.centerFormControl.setValue(this.battleRegisterService.currentlyOpenedItem.battleReportStatistics.uuid);
        } else {
            this.centerFormControl.setValue(null);
        }

    }
}
