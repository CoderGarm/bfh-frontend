import {Component, OnInit} from '@angular/core';
import {Job, JobApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-job-journal',
    templateUrl: './job-journal.component.html',
    styleUrls: ['./job-journal.component.scss']
})
export class JobJournalComponent extends SubscriptionManager implements OnInit {

    /**
     * all active jobs of the empire
     */
    runningJobs: Job[] = [];

    constructor(private jobService: JobApiService) {
        super();
    }

    ngOnInit(): void {
        this.loadData();
    }

    private loadData() {
        let sub = this.jobService.getJobsForEmpire().subscribe(resp => this.runningJobs = resp);
        this.subscriptions.push(sub);
    }
}
