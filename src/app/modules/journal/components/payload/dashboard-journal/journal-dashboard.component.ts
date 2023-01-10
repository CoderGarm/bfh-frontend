import {Component, OnInit} from '@angular/core';
import {FinishedColonization, FleetMovement, Job, JournalApiService, TransportJob} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-journal-dashboard',
    templateUrl: './journal-dashboard.component.html',
    styleUrls: ['./journal-dashboard.component.scss']
})
export class JournalDashboardComponent extends SubscriptionManager implements OnInit {

    finishedJobs: Job[] = [];

    transportJobs: TransportJob[] = [];

    finishedMovements: FleetMovement[] = [];
    finishedColonizations: FinishedColonization[] = [];

    constructor(private journalService: JournalApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.journalService.getFinishedJobs().subscribe(resp => this.finishedJobs = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getTransportJobs().subscribe(resp => this.transportJobs = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedMovements().subscribe(resp => this.finishedMovements = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedColonizations().subscribe(resp => this.finishedColonizations = resp);
        this.subscriptions.push(sub);
    }
}
