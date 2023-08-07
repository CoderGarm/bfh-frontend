import {Component, OnInit} from '@angular/core';
import {
    Commissioning,
    FinishedColonization,
    FleetMovement,
    Job,
    JobApiService,
    JournalApiService,
    MarketplaceApiService,
    MissionReport,
    ResourceDeposit,
    ResourcesApiService,
    TradesByLocation,
    TransportJob
} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-journal-dashboard',
    templateUrl: './journal-dashboard.component.html',
    styleUrls: ['./journal-dashboard.component.scss']
})
export class JournalDashboardComponent extends SubscriptionManager implements OnInit {

    finishedJobs: Job[] = [];
    finishedResearch?: Job;

    runningJobs: Job[] = [];
    runningResearch?: Job;

    transportJobs: TransportJob[] = [];
    movements: FleetMovement[] = [];
    colonizations: FinishedColonization[] = [];
    operationals: Commissioning[] = [];
    pending: Commissioning[] = [];
    trades: TradesByLocation[] = [];
    missionResults?: MissionReport;


    deposit?: ResourceDeposit;
    demand?: ResourceDeposit;
    utilization?: ResourceDeposit;
    income?: ResourceDeposit;

    constructor(private jobService: JobApiService,
                private journalService: JournalApiService,
                private resourceService: ResourcesApiService,
                private marketService: MarketplaceApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.jobService.getJobsForEmpire().subscribe(resp => {
            this.runningJobs = resp;
            const jobs = resp.filter(j => j.isResearchJob);
            this.runningResearch = jobs.length == 1 ? jobs[0] : undefined;
        });
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedJobs().subscribe(resp => {
            this.finishedJobs = resp;
            const jobs = resp.filter(j => j.isResearchJob);
            this.finishedResearch = jobs.length == 1 ? jobs[0] : undefined;
        });
        this.subscriptions.push(sub);

        sub = this.journalService.getTransportJobs().subscribe(resp => this.transportJobs = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedMovements().subscribe(resp => this.movements = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceDepositForUser().subscribe(resp => this.deposit = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceDemandForUser().subscribe(resp => this.demand = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceUtilizationForUser().subscribe(resp => this.utilization = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getIncomeForUser().subscribe(resp => this.income = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedColonizations().subscribe(resp => this.colonizations = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getNewlyActiveOperationals().subscribe(resp => this.operationals = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getOperationalsWaitingForActivation().subscribe(resp => this.pending = resp);
        this.subscriptions.push(sub);

        sub = this.marketService.getTradesForUser().subscribe(resp => this.trades = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getMissionResults().subscribe(resp => this.missionResults = resp);
        this.subscriptions.push(sub);
    }
}
