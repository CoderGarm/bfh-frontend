import {Injectable} from "@angular/core";
import {FleetApiService, Mission, MissionApiService, Planet, PlanetApiService, StarSystem, WarShip} from "../swagger";
import {SubscriptionManager} from "../../subscription.manager";
import {BackgroundService} from "../prefetch/background.service";
import MissionTypeEnum = Mission.MissionTypeEnum;

@Injectable()
export class MissionCommunicationService extends SubscriptionManager {

    activeMissions: Mission[] = [];

    pooledShips: WarShip[] = [];

    static readonly missionTypes: MissionTypeEnum[] = [MissionTypeEnum.PIRATE_HUNT, MissionTypeEnum.CONVOY_PROTECTION];

    planets: Planet[] = [];

    systems: StarSystem[] = [];

    constructor(private missionService: MissionApiService,
                private planetService: PlanetApiService,
                private systemService: BackgroundService,
                private fleetService: FleetApiService) {
        super();
    }

    fetchPlanets() {
        let sub = this.planetService.getPlanetByUsers().subscribe(resp => this.planets = resp);
        this.subscriptions.push(sub);
    }

    fetchStarSystems() {
        let sub = this.systemService.getStarSystems().subscribe(resp => this.systems = resp);
        this.subscriptions.push(sub);
    }

    fetchMissions() {
        let sub = this.missionService.getMissions().subscribe(resp => this.activeMissions = resp);
        this.subscriptions.push(sub);
    }

    fetchPooledShips() {
        let sub = this.fleetService.getPooledWarships().subscribe(resp =>
            this.pooledShips = resp
        );
        this.subscriptions.push(sub);
    }
}
