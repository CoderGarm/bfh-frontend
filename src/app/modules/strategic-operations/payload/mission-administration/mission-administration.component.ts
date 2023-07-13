import {AfterViewInit, Component, Predicate, ViewChild} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {Mission, StarSystem} from "../../../../services/swagger";
import {interval} from "rxjs";
import {SafeUrl} from "@angular/platform-browser";
import {NgxSpinnerService} from "ngx-spinner";
import {MatChipListbox} from "@angular/material/chips";
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

export interface CoordsBlob extends Array<Coords> {
}

@Component({
    selector: 'app-mission-administration',
    templateUrl: './mission-administration.component.html',
    styleUrls: ['./mission-administration.component.scss']
})
export class MissionAdministrationComponent extends SubscriptionManager implements AfterViewInit {

    url?: SafeUrl;

    colorGroups: ColorGroup[] = [];

    centerCoord?: Coords;

    @ViewChild('chipList')
    chipList!: MatChipListbox;

    message: string = 'loading mission map ...';

    constructor(protected missionCommService: MissionCommunicationService,
                private spinner: NgxSpinnerService) {
        super();
    }

    ngAfterViewInit(): void {

        this.spinner.show('mission-map');

        const source = interval(100);
        let sub = source.subscribe(val => {
            // and later again repetitive
            if (this.missionCommService.planets.length != 0 && this.missionCommService.systems.length > 0) {
                this.colorizeMissionMap();
                this.spinner.hide('mission-map');
                sub.unsubscribe();
            }
        });
        this.subscriptions.push(sub);
    }

    private colorizeMissionMap(): void {
        this.centerCoord = this.detectCenterByMainPlanet();
        this.colorGroups = this.detectColorGroups();
    }

    private detectColorGroups(predicate?: Predicate<Mission>) {
        const colonized = this.getColonizedSystemsWithoutMainSystem();
        const missions = this.detectMissionSystems(predicate);
        return [...colonized, ...missions];
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

    private getColonizedSystemsWithoutMainSystem(): ColorGroup[] {
        const mainStarSystemId: number = this.missionCommService.planets.filter(p => p.isMain).map(p => p.idStarSystem)[0];
        const starSystemIDs: number[] = this.missionCommService.planets.map(p => p.idStarSystem);
        const colonizedSystems: StarSystem[] = this.missionCommService.systems.filter(sys => sys.idStarSystem != mainStarSystemId && starSystemIDs.includes(sys.idStarSystem));
        return colonizedSystems.map(sys => {
            return <ColorGroup>{
                color: 'green',
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
                return 'blue';
            case "PIRATE_HUNT":
                return 'red';
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

        this.colorGroups = this.detectColorGroups(mission => selectedMissionTypes.includes(mission.missionType));

    }
}
