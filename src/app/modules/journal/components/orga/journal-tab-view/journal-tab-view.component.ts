import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {TypeService} from "../../../../../services/type.service";
import {BackgroundService} from "../../../../../services/background.service";
import {BattleReportApiService} from "../../../../../services/swagger";

@Component({
    selector: 'app-journal-tab-view',
    templateUrl: './journal-tab-view.component.html',
    styleUrls: ['./journal-tab-view.component.scss']
})
export class JournalTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'journal';

    hasNewReports: boolean = false;

    /**
     * @param typeService needed to fetch types after login
     * @param battleReportService nothing special
     * @param backgroundService needed after run long-running queries after login
     */
    constructor(private typeService: TypeService,
                private battleReportService: BattleReportApiService,
                private backgroundService: BackgroundService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.battleReportService.hasNewReportsForUser().subscribe(resp => this.hasNewReports = resp);
        this.subscriptions.push(sub);
    }

}
