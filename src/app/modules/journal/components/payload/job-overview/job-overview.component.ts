import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EnumValueDto, Job, Planet} from "../../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {SpinnerService} from "../../../../../services/spinner.service";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;


export interface PlanetaryJobs {
    idPlanet: number,
    planetName: string;
    construction?: Job,
    shipyard: Job[],
    finishedConstruction?: Job,
    finishedShipyard?: Job,
    isShipyardPresent: boolean
}

@Component({
    selector: 'app-job-overview',
    templateUrl: './job-overview.component.html',
    styleUrls: ['./job-overview.component.scss']
})
export class JobOverviewComponent implements OnChanges, AfterViewInit {

    dataSource: MatTableDataSource<PlanetaryJobs> = new MatTableDataSource<PlanetaryJobs>();

    @Input()
    finishedJobs: Job[] = [];

    @Input()
    finishedResearch?: Job;

    @Input()
    runningJobs: Job[] = [];

    @Input()
    runningResearch?: Job;

    @Input()
    planets: Planet[] = [];

    planetaryJobs: PlanetaryJobs[] = [];

    private inputCounter: number = 5;

    constructor(private spinner: SpinnerService) {
    }

    ngAfterViewInit() {
        this.spinner.show('job-dash-spinner');
    }

    ngOnChanges(changes: SimpleChanges) {
        this.organizeJobsPerPlanet();

        if (!!changes['finishedJobs'] && changes['finishedJobs'].isFirstChange()) {
            this.inputCounter--;
        }
        if (!!changes['finishedResearch'] && changes['finishedResearch'].isFirstChange()) {
            this.inputCounter--;
        }
        if (!!changes['runningJobs'] && changes['runningJobs'].isFirstChange()) {
            this.inputCounter--;
        }
        if (!!changes['runningResearch'] && changes['runningResearch'].isFirstChange()) {
            this.inputCounter--;
        }
        if (!!changes['planets'] && changes['planets'].isFirstChange()) {
            this.inputCounter--;
        }
        if (this.inputCounter == 0) {
            this.spinner.hide('job-dash-spinner');
        }
    }

    private organizeJobsPerPlanet() {
        this.planetaryJobs = [];
        this.planets.forEach(p => this.planetaryJobs.push({idPlanet: p.idPlanet, planetName: p.name, shipyard: [], isShipyardPresent: this.isShipyardPresent(p)}));

        this.runningJobs.forEach(job => {
            const buildingJob = job.isBuildingJob;
            const shipyardJob = job.isShipyardJob;

            let facilityPlanet = job.facilityPlanet;
            const planetaryJobs = this.planetaryJobs.filter(pj => pj.idPlanet == facilityPlanet.idPlanet);
            if (planetaryJobs.length == 0) {
                const jobsPerPlanet: PlanetaryJobs = {
                    idPlanet: facilityPlanet.idPlanet,
                    planetName: facilityPlanet.name,
                    construction: buildingJob ? job : undefined,
                    shipyard: shipyardJob ? [job] : [],
                    isShipyardPresent: this.isShipyardPresent(facilityPlanet)
                }
                this.planetaryJobs.push(jobsPerPlanet);
            } else {
                const jobsPerPlanet = planetaryJobs[0];
                if (buildingJob) {
                    jobsPerPlanet.construction = job;
                } else if (shipyardJob) {
                    if (!jobsPerPlanet.shipyard) {
                        jobsPerPlanet.shipyard = [];
                    }
                    jobsPerPlanet.shipyard.push(job);
                }
            }
        });

        this.finishedJobs.forEach(job => {
            const buildingJob = job.isBuildingJob;
            const shipyardJob = job.isShipyardJob;

            let facilityPlanet = job.facilityPlanet;
            const planetaryJobs = this.planetaryJobs.filter(pj => pj.idPlanet == facilityPlanet.idPlanet);
            if (planetaryJobs.length == 0) {
                const jobsPerPlanet: PlanetaryJobs = {
                    idPlanet: facilityPlanet.idPlanet,
                    planetName: facilityPlanet.name,
                    finishedConstruction: buildingJob ? job : undefined,
                    shipyard: [],
                    finishedShipyard: shipyardJob ? job : undefined,
                    isShipyardPresent: this.isShipyardPresent(facilityPlanet)
                }
                this.planetaryJobs.push(jobsPerPlanet);
            } else {
                const jobsPerPlanet = planetaryJobs[0];
                if (buildingJob) {
                    jobsPerPlanet.finishedConstruction = job;
                } else if (shipyardJob) {
                    jobsPerPlanet.finishedShipyard = job;
                }
            }
        });
        this.dataSource.data = this.planetaryJobs;
    }

    private isShipyardPresent(facilityPlanet: Planet) {
        return facilityPlanet.capabilities.map(c => c.typeName).includes(EResourceTypeEnum.ORBITAL_CONSTRUCTION);
    }
}
