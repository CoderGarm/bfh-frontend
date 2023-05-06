import {Component, OnInit} from '@angular/core';
import {Commissioning, FinishedColonization, FleetMovement, Job, JobApiService, JournalApiService, TransportJob} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-journal-dashboard',
    templateUrl: './journal-dashboard.component.html',
    styleUrls: ['./journal-dashboard.component.scss']
})
export class JournalDashboardComponent extends SubscriptionManager implements OnInit {

    jobs: Job[] = [];
    runningJobs: Job[] = [];
    transportJobs: TransportJob[] = [];
    movements: FleetMovement[] = [];
    colonizations: FinishedColonization[] = [];
    operationals: Commissioning[] = [];

    constructor(private jobService: JobApiService,
                private journalService: JournalApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.jobService.getJobsForEmpire().subscribe(resp => this.runningJobs = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedJobs().subscribe(resp => this.jobs = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getTransportJobs().subscribe(resp => this.transportJobs = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedMovements().subscribe(resp => this.movements = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedColonizations().subscribe(resp => this.colonizations = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getNewlyActiveOperationals().subscribe(resp => this.operationals = resp);
        this.subscriptions.push(sub);
    }
}
