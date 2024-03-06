import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {Alliance, AllianceApiService, BattleReportApiService, EnumValueDto, Player, SharedBattleReport, UserApiService} from "../../../../../services/swagger";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {MatListOption} from "@angular/material/list";
import ECalculationTypeEnum = EnumValueDto.ECalculationTypeEnum;

@Component({
    selector: 'app-battle-report-share',
    templateUrl: './battle-report-share.component.html',
    styleUrls: ['./battle-report-share.component.scss']
})
export class BattleReportShareComponent extends SubscriptionManager implements OnChanges, AfterViewInit {

    @Input()
    idBattleReport?: number;

    shared?: SharedBattleReport;

    users: Player[] = [];

    alliances: Alliance[] = [];

    constructor(private reportService: BattleReportApiService,
                private userService: UserApiService,
                private allianceService: AllianceApiService) {
        super();
    }

    ngAfterViewInit() {
        let sub = this.userService.getAllUsers().subscribe(resp => this.users = resp);
        this.subscriptions.push(sub);
        sub = this.allianceService.getAlliances().subscribe(resp => this.alliances = resp);
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges) {

        if (!!this.idBattleReport) {
            let sub = this.reportService.getReportSharings(this.idBattleReport)
                .subscribe(resp => this.shared = resp);
            this.subscriptions.push(sub);
        }
    }

    setEveryone(event: MatCheckboxChange) {
        if (!this.idBattleReport) {
            return
        }

        let sub = this.reportService.changeReportSharings({
            idBattleReport: this.idBattleReport,
            shareWithEveryone: event.checked,
            calculationType: event.checked ? ECalculationTypeEnum.ADD : ECalculationTypeEnum.SUBTRACT,
        }).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    setAlliance(item: MatListOption, alliance: Alliance) {
        if (!this.idBattleReport) {
            return
        }
        let sub = this.reportService.changeReportSharings({
            idBattleReport: this.idBattleReport,
            sharedWithAlliance: alliance.idAlliance,
            calculationType: item.selected ? ECalculationTypeEnum.ADD : ECalculationTypeEnum.SUBTRACT,
        }).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    setUser(item: MatListOption, user: Player) {
        if (!this.idBattleReport) {
            return
        }
        let sub = this.reportService.changeReportSharings({
            idBattleReport: this.idBattleReport,
            sharedWithUser: user.idUser,
            calculationType: item.selected ? ECalculationTypeEnum.ADD : ECalculationTypeEnum.SUBTRACT,
        }).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    isAllianceShared(item: Alliance) {
        if (!this.shared) {
            return false;
        }
        return !!this.shared.sharedWithAlliance.find(a => a.idAlliance == item.idAlliance);
    }

    isUserShared(item: Player) {
        if (!this.shared) {
            return false;
        }
        console.log(item, this.shared.sharedWithUsers)
        return !!this.shared.sharedWithUsers.find(u => u.id == item.idUser);
    }
}
