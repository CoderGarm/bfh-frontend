import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Job, JobApiService, Planet} from "../../../../../services/swagger";
import {PlanetsEventService} from "../../../planets-event.service";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-planetary-job-list',
    templateUrl: './planetary-job-list.component.html',
    styleUrls: ['./planetary-job-list.component.scss']
})
export class PlanetaryJobListComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    selectedPlanetInput?: Planet;
    private selectedPlanetDefinition = "selectedPlanetInput";

    /**
     * all active jobs on the planet
     */
    runningJobs: Job[] = [];

    constructor(private jobApi: JobApiService,
                private notificationService: PlanetsEventService) {
        super();
        let subscription = notificationService.getConstructionStartsEmitter().subscribe(() => this.loadData());
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
        }
    }
}
