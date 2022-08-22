import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Job, JobApiService, Planet, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {PlanetsNotificationService} from "../../../planets-notification.service";

@Component({
    selector: 'app-jobs-list',
    templateUrl: './jobs-list.component.html',
    styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: Job;

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    selectedPlanetInput?: Planet;
    private selectedPlanetDefinition = "selectedPlanetInput";

    resourceDeposit?: ResourceDeposit;

    /**
     * all active jobs on the planet
     * @private
     */
    runningJobs?: Job[];

    constructor(private jobApi: JobApiService,
                private resourceApi: ResourcesApiService,
                private notificationService: PlanetsNotificationService) {
        super();
        let subscription = notificationService.ask().subscribe(() => this.loadData());
        this.subscriptions.push(subscription);
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            this.loadData();
        }
    }

    private loadData() {
        if (this.selectedPlanetInput) {
            let sub = this.jobApi.getJobsOnPlanet(this.selectedPlanetInput.idPlanet)
                .subscribe(resp => this.runningJobs = resp);
            this.subscriptions.push(sub);

            sub = this.resourceApi.getResourceDeposit(this.selectedPlanetInput.idPlanet)
                .subscribe(resp => {
                    this.resourceDeposit = resp;
                });
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the opened item
     * @param itemIndex
     */
    setOpened(itemIndex: Job) {
        this.currentlyOpenedItemIndex = itemIndex;
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the closed item
     * @param itemIndex
     */
    setClosed(itemIndex: Job) {
        if (this.currentlyOpenedItemIndex === itemIndex) {
            this.currentlyOpenedItemIndex = undefined;
        }
    }

    /**
     * returns true if the description should be displayed, false otherwise
     * @param job
     */
    showDescription(job: Job): boolean {
        return this.currentlyOpenedItemIndex != job;
    }

    /**
     * returns the title text of this job
     * @param job
     */
    getTitle(job: Job): string {
        if (job.isBuildingJob) {
            return job.buildingTarget?.name + " lvl " + job.targetLevel;
        }
        if (job.isResearchJob) {
            return job.researchTarget + " lvl " + job.targetLevel;
        }
        if (job.isShipyardJob) {
            return job.shipYardTarget + " x" + job.amountShips;
        }
        return "";
    }

    /**
     * returns the description text for this job
     * @param job
     */
    getDescription(job: Job): string {
        return job.ticksLeft + " ticks left";
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(job: Job): string {
        let folder = job.facility.building.productionTarget.folder;
        let iconName = job.facility.building.productionTarget.iconName;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }

    getInvisibility(job: Job) {
        return this.currentlyOpenedItemIndex === job ? 'invisible' : '';
    }
}
