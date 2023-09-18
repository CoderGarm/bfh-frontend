import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Job, Planet} from "../../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";


export interface PlanetaryJobs {
    idPlanet: number,
    planetName: string;
    construction?: Job,
    shipyard?: Job[],
    finishedConstruction?: Job,
    finishedShipyard?: Job,
}

@Component({
    selector: 'app-job-overview',
    templateUrl: './job-overview.component.html',
    styleUrls: ['./job-overview.component.scss']
})
export class JobOverviewComponent implements OnChanges {

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

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.organizeJobsPerPlanet();
    }

    private organizeJobsPerPlanet() {
        this.planetaryJobs = [];
        this.planets.forEach(p => this.planetaryJobs.push({idPlanet: p.idPlanet, planetName: p.name}));

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
                    shipyard: shipyardJob ? [job] : undefined
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
                    finishedShipyard: shipyardJob ? job : undefined
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
}
