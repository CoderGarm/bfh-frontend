import {AfterViewInit, Component, Predicate, ViewChild} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {Mission, StarSystem} from "../../../../services/swagger";
import {interval} from "rxjs";
import {SafeUrl} from "@angular/platform-browser";
import {MatChipListbox} from "@angular/material/chips";
import {MissionMapComponent} from "../mission-map/mission-map.component";
import MissionTypeEnum = Mission.MissionTypeEnum;

export interface ColorGroup {
    color: string;
    simpleCoords: SimpleCoord[];
    coords: Coords[];
}

export interface SimpleCoord {
    x: number;
    y: number;
}

export interface Coords {
    x: number;
    y: number;
    name: string;
}

@Component({
    selector: 'app-mission-administration',
    templateUrl: './mission-administration.component.html',
    styleUrls: ['./mission-administration.component.scss']
})
export class MissionAdministrationComponent extends SubscriptionManager implements AfterViewInit {

    url?: SafeUrl;

    colorGroups: ColorGroup[] = [];
    colonized: ColorGroup[] = [];

    centerCoord?: Coords;

    @ViewChild('chipList')
    chipList!: MatChipListbox;

    constructor(protected missionCommService: MissionCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
        const source = interval(100);
        let sub = source.subscribe(val => {
            // and later again repetitive
            if (this.missionCommService.planets.length != 0 && this.missionCommService.systems.length > 0) {
                this.colorizeMissionMap();
                sub.unsubscribe();
            }
        });
        this.subscriptions.push(sub);
    }

    private colorizeMissionMap(): void {
        this.centerCoord = this.detectCenterByMainPlanet();
        this.colonized = this.getColonizedSystems();
        this.colorGroups = this.detectMissionSystems();
    }

    private detectMissionSystems(predicate?: Predicate<Mission>): ColorGroup[] {
        if (!predicate) {
            predicate = f => !!f;
        }
        return this.missionCommService.activeMissions.filter(predicate).map(mission => {
            return <ColorGroup>{
                color: this.getColor(mission.missionType),
                coords: this.getSystemCoordsFromMission(mission),
                simpleCoords: this.getSystemCoordsFromMission(mission)
            }
        });
    }

    private getColonizedSystems(): ColorGroup[] {
        const starSystemIDs: number[] = this.missionCommService.planets.map(p => p.idStarSystem);
        const colonizedSystems: StarSystem[] = this.missionCommService.systems.filter(sys => starSystemIDs.includes(sys.idStarSystem));
        return colonizedSystems.map(sys => {
            return <ColorGroup>{
                color: MissionMapComponent.COLONIZED_COLOR,
                coords: this.getCoordsFromOrbit(sys),
                simpleCoords: this.getCoordsFromOrbit(sys)
            }
        });
    }

    private detectCenterByMainPlanet(): Coords {
        const mainStarSystemId: number = this.missionCommService.planets.filter(p => p.isMain).map(p => p.idStarSystem)[0];
        return this.getCoordFromSystem(mainStarSystemId);
    }

    private getCoordFromSystem(mainStarSystemId: number): Coords {
        const mainSystem: StarSystem = this.missionCommService.systems.filter(sys => sys.idStarSystem == mainStarSystemId)[0];
        return {
            x: mainSystem.orbit.xCoordinate.coordinate,
            y: mainSystem.orbit.yCoordinate.coordinate,
            name: mainSystem.name
        }
    }

    getColor(coord: MissionTypeEnum): string {
        switch (coord) {
            case "CONVOY_PROTECTION":
                return MissionMapComponent.CONVOY_PROTECTION_COLOR;
            case "PIRATE_HUNT":
                return MissionMapComponent.PIRATE_HUNT_COLOR;
            default:
                return '';
        }
    }

    private getSystemCoordsFromMission(mission: Mission): Coords[] {
        const idStarSystem = mission.venue.idStarSystem;
        return [this.getCoordFromSystem(idStarSystem)];
    }

    private getCoordsFromOrbit(system: StarSystem): Coords[] {
        const orbit = system.orbit;
        return [{x: orbit.xCoordinate.coordinate, y: orbit.yCoordinate.coordinate, name: system.name}];
    }

    missionTypeChange() {
        const selectedMissionTypes = this.chipList._chips
            .filter(chip => chip.selected)
            .map(chip => <MissionTypeEnum>chip.value);

        this.colorGroups = this.detectMissionSystems(mission => selectedMissionTypes.includes(mission.missionType));
    }
}
