import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {JobApiService, Planet} from "../../../../../services/swagger";
import {Subscription} from "rxjs";
import {Job} from "../../../../../services/swagger/model/job";

@Component({
    selector: 'app-jobs-list',
    templateUrl: './jobs-list.component.html',
    styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements AfterViewInit, OnChanges {

    /**
     * every sub which should be cancelled on destroy
     * @private
     */
    private subscriptions: Subscription[] = [];

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

    /**
     * all active jobs on the planet
     * @private
     */
    runningJobs?: Job[];

    constructor(private jobApi: JobApiService) {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            if (this.selectedPlanetInput) {
                const sub = this.jobApi.getJobsOnPlanet(this.selectedPlanetInput.idPlanet)
                    .subscribe(resp => this.runningJobs = resp);
                this.subscriptions.push(sub);
            }
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
}
