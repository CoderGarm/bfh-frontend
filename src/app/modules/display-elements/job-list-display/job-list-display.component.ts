import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EHullType, Fleet, Job, JobApiService, Planet} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {TranslateService} from "@ngx-translate/core";

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
export class JobListDisplayComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    title_key: string = 'jobs.active-title';

    @Input()
    runningJobs: Job[] = [];
    runningJobsDefinition: string = 'runningJobs';

    @Input()
    allowCancel: boolean = false;

    jobsPerIdPlanet: Map<number, Job[]> = new Map<number, Job[]>();
    jobs: PlanetaryJobs[] = [];

    translations: Map<string, string> = new Map<string, string>();

    constructor(private translate: TranslateService,
                private jobService: JobApiService) {
        super();

        this.translations.set('jobs.active-title', 'jobs.active-title');
        let sub = this.translate.get('jobs.active-title').subscribe((translated: string) => {
            this.translations.set('jobs.active-title', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('jobs.finished-title', 'jobs.finished-title');
        sub = this.translate.get('jobs.finished-title').subscribe((translated: string) => {
            this.translations.set('jobs.finished-title', translated);
        });
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.runningJobsDefinition]) {
            this.prepareData();
        }
    }

    private prepareData() {
        this.sortJobsByPlanet();
        this.organizeJobsPerPlanet();
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
        return "assets/" + folder + "/png64x/" + iconName + "_c.png";
    }

    getPercentage(fleet: Fleet) {
        let max = 0;
        fleet.spacecraftCapabilities.capabilities.forEach(value => max += value.value);

        let current = 0;
        const currentCaps = fleet.spacecraftCapabilities;
        if (!currentCaps) {
            current = max;
        } else {
            currentCaps.capabilities.forEach(value => current += value.value);
        }
        return Math.round((current / max) * 100) + " %";
    }

    getHullCount(fleet: Fleet) {
        let m: Map<EHullType, number> = new Map<EHullType, number>();
        fleet.ships.forEach(w => {
            const hullType = w.shipClass.hull!.hullType;
            let amount = m.get(hullType);
            if (!amount) {
                amount = 0;
            }
            amount += 1;
            m.set(hullType, amount);
        });
        let result = "";
        m.forEach((amount, hullType) => result += ", " + amount + " " + hullType.typeName);
        return fleet.ships.length + " ships";
    }

    cancelJob(job: Job) {
        let sub = this.jobService.cancelJob(job.idJob).subscribe(resp => {
            if (resp) {
                this.loadData();
            }
        });
        this.subscriptions.push(sub);
    }

    private loadData() {
        let sub = this.jobService.getJobsForEmpire().subscribe(resp => {
            this.runningJobs = resp;
            this.prepareData();
        });
        this.subscriptions.push(sub);
    }
}
