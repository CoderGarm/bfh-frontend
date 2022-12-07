import {Component, OnInit} from '@angular/core';
import {ColonizationApiService, FinishedColonization, FleetApiService, FleetMovement, Job, JobApiService, TransportJob} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-dashboard-journal',
    templateUrl: './dashboard-journal.component.html',
    styleUrls: ['./dashboard-journal.component.scss']
})
export class DashboardJournalComponent extends SubscriptionManager implements OnInit {

    finishedJobs: Job[] = [];

    transportJobs: TransportJob[] = [];

    finishedMovements: FleetMovement[] = [];
    finishedColonizations: FinishedColonization[] = [];

    constructor(private jobService: JobApiService,
                private fleetService: FleetApiService,
                private colonizationService: ColonizationApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.jobService.getFinishedJobs().subscribe(resp => this.finishedJobs = resp);
        this.subscriptions.push(sub);

        sub = this.jobService.getTransportJobs().subscribe(resp => this.transportJobs = resp);
        this.subscriptions.push(sub);

        sub = this.fleetService.getFinishedMovements().subscribe(resp => this.finishedMovements = resp);
        this.subscriptions.push(sub);

        sub = this.colonizationService.getFinishedColonizations().subscribe(resp => this.finishedColonizations = resp);
        this.subscriptions.push(sub);
    }
}
