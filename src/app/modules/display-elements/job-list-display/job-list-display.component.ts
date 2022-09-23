import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Job, Planet} from "../../../services/swagger";

export interface PlanetaryJobs {
    idPlanet: number,
    planet: Planet,
    constructions?: Job[],
    researches?: Job[],
    shipyard?: Job[]
}

@Component({
    selector: 'app-job-list-display',
    templateUrl: './job-list-display.component.html',
    styleUrls: ['./job-list-display.component.scss']
})
export class JobListDisplayComponent implements OnInit, OnChanges {

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: Job;

    @Input()
    runningJobs: Job[] = [];
    runningJobsDefinition: string = 'runningJobs';

    jobsPerIdPlanet: Map<number, Job[]> = new Map<number, Job[]>();
    jobs: PlanetaryJobs[] = [];

    constructor() {
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.runningJobsDefinition]) {
            this.sortJobsByPlanet();
            this.organizeJobsPerPlanet();
        }
    }

    private organizeJobsPerPlanet() {
        this.jobsPerIdPlanet.forEach((jobs, idPlanet) => {
            let facilityPlanet = jobs[0].facilityPlanet;
            const jobsPerPlanet: PlanetaryJobs = {
                idPlanet: idPlanet,
                planet: facilityPlanet,
                constructions: jobs.filter(job => job.isBuildingJob),
                researches: jobs.filter(job => job.isResearchJob),
                shipyard: jobs.filter(job => job.isShipyardJob)
            }
            this.jobs.push(jobsPerPlanet);
        });
    }

    private sortJobsByPlanet() {

        this.jobs = [];
        this.jobsPerIdPlanet = new Map<number, Job[]>();

        this.runningJobs.forEach(job => {
            let idPlanet = job.facilityPlanet.idPlanet;
            let jobs = this.jobsPerIdPlanet.get(idPlanet);
            if (!jobs) {
                jobs = [];
            }
            jobs.push(job);
            this.jobsPerIdPlanet.set(idPlanet, jobs);
        });
    }

    getLink(job: Job): string {
        let folder = job.facility.building.productionTarget.folder;
        let iconName = job.facility.building.productionTarget.iconName;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }
}
