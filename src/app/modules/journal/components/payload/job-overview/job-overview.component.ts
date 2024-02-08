import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractId, EnumValueDto, Job, JobApiService, Planet} from "../../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {SubscriptionManager} from "../../../../../subscription.manager";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;


export interface PlanetaryJobs {
    idPlanet: number,
    planetName: string;
    construction?: Job,
    shipyard: Job[],
    finishedConstructions: Job[],
    finishedShipyards: Job[],
    isShipyardPresent: boolean
}

@Component({
    selector: 'app-job-overview',
    templateUrl: './job-overview.component.html',
    styleUrls: ['./job-overview.component.scss']
})
export class JobOverviewComponent extends SubscriptionManager implements OnChanges {

    dataSource: MatTableDataSource<PlanetaryJobs> = new MatTableDataSource<PlanetaryJobs>();

    @Input()
    finishedJobs: Job[] = [];

    @Input()
    finishedResearches: Job[] = []

    @Input()
    runningResearch?: Job;

    @Input()
    planets: Planet[] = [];

    planetaryJobs: PlanetaryJobs[] = [];

    fetchCounter: number = 0;

    planetsBySystem: Map<number, number[]> = new Map<number, number[]>();
    sortedPlanetsBySystem: Map<AbstractId, Planet[]> = new Map<AbstractId, Planet[]>();
    sortedPlanets: Planet[] = [];

    constructor(private jobService: JobApiService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges) {

        if (!!changes['planets']) {
            this.fetchCounter = this.planets.length;
            // fixme planet icons for possible constructions
            this.planets
                .sort((a, b) => new Date(a.colonizedAt!).getTime() - new Date(b.colonizedAt!).getTime())
                .forEach(planet => {
                    let sub = this.jobService.getJobsOnPlanet(planet.idPlanet).subscribe(resp => {
                        resp.forEach(job => {
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
                                    finishedConstructions: [],
                                    finishedShipyards: [],
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
                            this.dataSource.data = this.planetaryJobs;
                        });
                        this.fetchCounter--;
                    });
                    this.subscriptions.push(sub);
                });
        }
        this.organizeJobsPerPlanet();
    }

    private organizeJobsPerPlanet() {
        this.planetaryJobs = [];
        this.planets.forEach(p => {
            const idStarSystem = p.starSystem.id;
            const idPlanet = p.idPlanet;
            let planets = this.planetsBySystem.get(idStarSystem);
            if (!planets) {
                planets = [];
            }
            planets.push(idPlanet);
            this.planetsBySystem.set(idStarSystem, planets);
        });

        this.planetsBySystem.forEach((planetIDs, idStarSystem) => {
            const planets = this.planets.filter(p => planetIDs.includes(p.idPlanet));
            const starSystem = planets[0].starSystem;
            this.sortedPlanetsBySystem.set(starSystem, planets);
            this.sortedPlanets.push(...planets);
        });

        this.planets.forEach(p => this.planetaryJobs.push({
            idPlanet: p.idPlanet,
            planetName: p.name,
            shipyard: [],
            finishedConstructions: [],
            finishedShipyards: [],
            isShipyardPresent: this.isShipyardPresent(p)
        }));


        this.finishedJobs.forEach(job => {
            const buildingJob = job.isBuildingJob;
            const shipyardJob = job.isShipyardJob;

            let facilityPlanet = job.facilityPlanet;
            const planetaryJobs = this.planetaryJobs.filter(pj => pj.idPlanet == facilityPlanet.idPlanet);
            if (planetaryJobs.length == 0) {
                const jobsPerPlanet: PlanetaryJobs = {
                    idPlanet: facilityPlanet.idPlanet,
                    planetName: facilityPlanet.name,
                    finishedConstructions: [buildingJob] ? [job] : [],
                    shipyard: [],
                    finishedShipyards: [shipyardJob] ? [job] : [],
                    isShipyardPresent: this.isShipyardPresent(facilityPlanet)
                }
                this.planetaryJobs.push(jobsPerPlanet);
            } else {
                const jobsPerPlanet = planetaryJobs[0];
                if (buildingJob) {
                    jobsPerPlanet.finishedConstructions.push(job);
                } else if (shipyardJob) {
                    jobsPerPlanet.finishedShipyards.push(job);
                }
            }
        });
        this.dataSource.data = this.planetaryJobs;
        this.sortDataSource();
    }

    private isShipyardPresent(facilityPlanet: Planet) {
        return facilityPlanet.capabilities.map(c => c.typeName).includes(EResourceTypeEnum.ORBITAL_CONSTRUCTION);
    }

    isPrioJob(job: Job, shipyard: Job[]) {
        if (shipyard.length == 1) {
            return true;
        }
        if (shipyard.length > 1 && job.priority === Job.PriorityEnum.NONE) {
            return false;
        }
        return shipyard.filter(job => job.priority === Job.PriorityEnum.PRIORITY).sort((a, b) => a.pointsLeft - b.pointsLeft).indexOf(job) == 0;
    }

    sortDataSource() {
        this.dataSource.data.sort((a: PlanetaryJobs, b: PlanetaryJobs) => {
            const o1 = this.sortedPlanets.findIndex(p => p.idPlanet == a.idPlanet);
            const o2 = this.sortedPlanets.findIndex(p => p.idPlanet == b.idPlanet);
            return o1 - o2;
        });
    }
}
