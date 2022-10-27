import {Component, OnInit} from '@angular/core';
import {Job, JobApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-dashboard-journal',
    templateUrl: './dashboard-journal.component.html',
    styleUrls: ['./dashboard-journal.component.scss']
})
export class DashboardJournalComponent extends SubscriptionManager implements OnInit {

    finishedJobs: Job[] = [];

    constructor(private jobApi: JobApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.jobApi.getFinishedJobs().subscribe(resp => this.finishedJobs = resp);
        this.subscriptions.push(sub);
    }

}
