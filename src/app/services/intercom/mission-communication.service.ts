import {Injectable} from "@angular/core";
import {FleetApiService, Mission, MissionApiService, Planet, PlanetApiService, StarSystem, WarShip} from "../swagger";
import {SubscriptionManager} from "../../subscription.manager";
import {BackgroundService} from "../prefetch/background.service";
import MissionTypeEnum = Mission.MissionTypeEnum;

@Injectable()
export class MissionCommunicationService extends SubscriptionManager {

    activeMissions: Mission[] = [];

    activeMissionsByVenue: Map<number, Mission[]> = new Map<number, Mission[]>();

    pooledShips: WarShip[] = [];

    static readonly missionTypes: MissionTypeEnum[] = [MissionTypeEnum.PIRATE_HUNT, MissionTypeEnum.CONVOY_PROTECTION];

    colonizedPlanets: Planet[] = [];

    planetsWithoutMissions: Planet[] = [];

    systems: StarSystem[] = [];

    selectedPlanet?: Planet;

    constructor(private missionService: MissionApiService,
                private planetService: PlanetApiService,
                private systemService: BackgroundService,
                private fleetService: FleetApiService) {
        super();
    }

    createMission(mission: Mission) {
        return this.missionService.setupMission(mission);
    }

    stopMission(idMission: number) {
        return this.missionService.stopMission(idMission);
    }

    fetchPlanets() {
        let sub = this.planetService.getPlanetByUsers().subscribe(resp => {
            this.colonizedPlanets = resp;
            this.buildPlanetsWithoutMission();
        });
        this.subscriptions.push(sub);
    }

    fetchStarSystems() {
        let sub = this.systemService.getStarSystems().subscribe(resp => this.systems = resp);
        this.subscriptions.push(sub);
    }

    fetchMissions() {
        let sub = this.missionService.getMissions().subscribe(resp => {
            this.activeMissions = resp;
            this.buildPlanetsWithoutMission();
            resp.forEach(mission => {
                let missions = this.activeMissionsByVenue.get(mission.venue.idPlanet);
                if (!missions) {
                    missions = [];
                    this.activeMissionsByVenue.set(mission.venue.idPlanet, missions);
                }
                missions.push(mission);
            });
        });
        this.subscriptions.push(sub);
    }

    fetchPooledShips() {
        let sub = this.fleetService.getPooledWarships().subscribe(resp =>
            this.pooledShips = resp
        );
        this.subscriptions.push(sub);
    }

    dropMission(idMission: number) {

        const missions = this.activeMissions.filter(m => m.idMission === idMission);
        if (missions.length === 1) {
            const toRemove = missions[0];
            const indexOf = this.activeMissions.indexOf(toRemove);
            this.activeMissions.splice(indexOf, 1);
            this.pooledShips.push(...(toRemove.ships));
            this.buildPlanetsWithoutMission();
        }
    }

    private buildPlanetsWithoutMission() {
        const idPlanetsWithMissions = this.activeMissions.map(m => m.venue.idPlanet);
        this.planetsWithoutMissions = this.colonizedPlanets.filter(p => !idPlanetsWithMissions.includes(p.idPlanet));
    }
}
