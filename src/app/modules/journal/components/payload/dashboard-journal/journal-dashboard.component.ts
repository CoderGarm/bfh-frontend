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
    Planet,
    PlanetApiService,
    ResourceDeposit,
    ResourcesApiService,
    TradesByLocation,
    TransportJob
} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {CurrentTickService} from "../../../../../services/intercom/current-tick.service";

@Component({
    selector: 'app-journal-dashboard',
    templateUrl: './journal-dashboard.component.html',
    styleUrls: ['./journal-dashboard.component.scss']
})
export class JournalDashboardComponent extends SubscriptionManager implements OnInit {

    finishedJobs: Job[] = [];
    finishedResearches: Job[] = [];

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

    sumOfPops: number = 0;
    capacitySum: number = 0;
    planets: Planet[] = [];

    hasNewFleetInfo: boolean = false;
    hasNewCarrierInfo: boolean = false;
    hasNewJobInfo: boolean = false;
    hasNewInfraInfo: boolean = false;

    constructor(private currentTickService: CurrentTickService,
                private jobService: JobApiService,
                private planetService: PlanetApiService,
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
            this.finishedResearches = jobs;
            this.stateNewJobInfo();
        });
        this.subscriptions.push(sub);

        sub = this.planetService.getPlanetByUsers().subscribe(resp => this.planets = resp);
        this.subscriptions.push(sub);

        sub = this.journalService.getTransportJobs().subscribe(resp => {
            this.transportJobs = resp;
            this.stateCarrierInfo();
        });
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedMovements().subscribe(resp => {
            this.movements = resp;
            this.stateNewFleetInfo();
        });
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceDepositForUser().subscribe(resp => this.deposit = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceDemandForUser().subscribe(resp => this.demand = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getResourceUtilizationForUser().subscribe(resp => this.utilization = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getIncomeForUser().subscribe(resp => this.income = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getPopOverview().subscribe(resp => {
            this.sumOfPops = resp.present
            this.capacitySum = resp.capacity;
        });
        this.subscriptions.push(sub);

        sub = this.journalService.getFinishedColonizations().subscribe(resp => {
            this.colonizations = resp;
            this.stateNewInfraInfo();
        });
        this.subscriptions.push(sub);

        sub = this.journalService.getNewlyActiveOperationals().subscribe(resp => {
            this.operationals = resp;
            this.stateNewInfraInfo();
        });
        this.subscriptions.push(sub);

        sub = this.journalService.getOperationalsWaitingForActivation().subscribe(resp => this.pending = resp);
        this.subscriptions.push(sub);

        sub = this.marketService.getTradesForUser().subscribe(resp => {
            this.trades = resp;
            this.stateCarrierInfo();
        });
        this.subscriptions.push(sub);

        sub = this.journalService.getMissionResults().subscribe(resp => {
            this.missionResults = resp;
            this.stateNewFleetInfo();
        });
        this.subscriptions.push(sub);
    }

    private stateNewFleetInfo() {
        let sub = this.currentTickService.tickEmitter.subscribe(tick => {
            if (!tick) {
                return;
            }
            const topicRead = this.tokenStorage.isJournalTopicRead(tick.tickNo, 'fleetInfo');
            this.hasNewFleetInfo = !topicRead && (this.movements.length > 0 || (!!this.missionResults && (this.missionResults.actionItemGroups.length > 0 || this.missionResults.convoyActionItemGroups.length > 0)));
        });
        this.subscriptions.push(sub);
    }

    private stateNewJobInfo() {
        let sub = this.currentTickService.tickEmitter.subscribe(tick => {
            if (!tick) {
                return;
            }
            const topicRead = this.tokenStorage.isJournalTopicRead(tick.tickNo, 'jobInfo');
            this.hasNewJobInfo = !topicRead && (this.finishedJobs.length > 0 || !!this.finishedResearches);
        });
        this.subscriptions.push(sub);
    }

    private stateCarrierInfo() {
        let sub = this.currentTickService.tickEmitter.subscribe(tick => {
            if (!tick) {
                return;
            }
            const topicRead = this.tokenStorage.isJournalTopicRead(tick.tickNo, 'carrierInfo');
            this.hasNewCarrierInfo = !topicRead && (this.transportJobs.length > 0 || this.trades.filter(t => t.tradesByTick.filter(byTick => byTick.tick.tickNo == this.currentTickService.currentTick?.tickNo).length > 0).length > 0);
        });
        this.subscriptions.push(sub);
    }

    private stateNewInfraInfo() {
        let sub = this.currentTickService.tickEmitter.subscribe(tick => {
            if (!tick) {
                return;
            }
            const topicRead = this.tokenStorage.isJournalTopicRead(tick.tickNo, 'infraInfo');
            this.hasNewInfraInfo = !topicRead && (this.colonizations.length > 0 || this.operationals.length > 0);
        });
        this.subscriptions.push(sub);
    }

    markTopicRead(topic: string) {
        if (!this.currentTickService.currentTick) {
            return;
        }
        this.tokenStorage.addReadJournalTopics(this.currentTickService.currentTick.tickNo, topic);
    }
}
