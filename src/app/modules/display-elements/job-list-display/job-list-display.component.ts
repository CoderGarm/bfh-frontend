import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EShipClassType, Fleet, Job, JobApiService, Planet} from "../../../services/swagger";
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
    title_key: string = 'active';

    @Input()
    jobs: Job[] = [];
    jobsDefinition: string = 'jobs';

    @Input()
    allowCancel: boolean = false;

    jobsPerIdPlanet: Map<number, Job[]> = new Map<number, Job[]>();
    planetaryJobs: PlanetaryJobs[] = [];

    translations: Map<string, string> = new Map<string, string>();

    constructor(private translate: TranslateService,
                private jobService: JobApiService) {
        super();

        this.translations.set('jobs.title.active', 'jobs.title.active');
        let sub = this.translate.get('jobs.title.active').subscribe((translated: string) => {
            this.translations.set('jobs.title.active', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('jobs.title.finished', 'jobs.title.finished');
        sub = this.translate.get('jobs.title.finished').subscribe((translated: string) => {
            this.translations.set('jobs.title.finished', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('jobs.nothing.active', 'jobs.nothing.active');
        sub = this.translate.get('jobs.nothing.active').subscribe((translated: string) => {
            this.translations.set('jobs.nothing.active', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('jobs.nothing.finished', 'jobs.nothing.finished');
        sub = this.translate.get('jobs.nothing.finished').subscribe((translated: string) => {
            this.translations.set('jobs.nothing.finished', translated);
        });
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.jobsDefinition]) {
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
            this.planetaryJobs.push(jobsPerPlanet);
        });
    }

    private sortJobsByPlanet() {

        this.planetaryJobs = [];
        this.jobsPerIdPlanet = new Map<number, Job[]>();

        this.jobs.forEach(job => {
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
        let m: Map<EShipClassType, number> = new Map<EShipClassType, number>();
        fleet.ships.forEach(w => {
            const hullType = w.shipClass.shipClassType;
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
            this.jobs = resp;
            this.prepareData();
        });
        this.subscriptions.push(sub);
    }
}
