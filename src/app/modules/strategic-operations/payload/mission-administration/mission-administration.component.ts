import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {EnumValueDto, Mission, StarSystem} from "../../../../services/swagger";
import {interval} from "rxjs";
import {MatChipListbox} from "@angular/material/chips";
import {MissionMapComponent} from "../mission-map/mission-map.component";
import {LocalMapOrbitDefinition} from "../mission-map/local-map-orbit-definition";
import MissionTypeEnum = Mission.MissionTypeEnum;
import EMissionTypesEnum = EnumValueDto.EMissionTypesEnum;

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

    orbitDefinitions: LocalMapOrbitDefinition[] = [];

    selectedMissionTypes: MissionTypeEnum[] = MissionCommunicationService.missionTypes;

    @ViewChild('chipList')
    chipList!: MatChipListbox;

    selectedSystem?: StarSystem;
    missions: Mission[] = [];

    protected readonly MissionCommunicationService = MissionCommunicationService;

    constructor(protected missionCommService: MissionCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
        const source = interval(100);
        let sub = source.subscribe(val => {
            // and later again repetitive
            if (this.missionCommService.planets.length != 0 && this.missionCommService.systems.length > 0) {
                this.orbitDefinitions = this.getOrbitDefinitions();
                sub.unsubscribe();
            }
        });
        this.subscriptions.push(sub);
    }

    setSelectedSystem(selectedSystem: StarSystem | undefined) {
        this.selectedSystem = selectedSystem;
        this.missions = this.getMissionsBySystem(selectedSystem);
    }

    private getOrbitDefinitions(selectedMissionTypes?: MissionTypeEnum[]): LocalMapOrbitDefinition[] {
        return this.missionCommService.systems.map(system => {
            const coords: Coords = {name: system.name, x: system.orbit.xCoordinate.coordinate, y: system.orbit.yCoordinate.coordinate};
            const missionTypes: EMissionTypesEnum[] = this.getMissionsBySystem(system, selectedMissionTypes).map(m => m.missionType);

            let isColonized: boolean = false;
            let isColonizedByOtherUser: boolean = false;
            let isNpc: boolean = false;
            let isMain: boolean = false;
            system.planets.forEach(planet => {
                if (!!planet.owner) {
                    if (planet.owner.idUser == this.userId) {
                        isColonized = true;
                        if (planet.isMain) {
                            isMain = true;
                        }
                    } else if (planet.owner.isNpc) {
                        isNpc = true;
                    } else {
                        isColonizedByOtherUser = true;
                    }
                }
            });

            return new LocalMapOrbitDefinition(coords, isMain, isColonized, isColonizedByOtherUser, isNpc, missionTypes);
        });
    }

    private getMissionsBySystem(system?: StarSystem, selectedMissionTypes?: MissionTypeEnum[]): Mission[] {
        if (!system) {
            return [];
        }
        let missions: Mission[] = this.missionCommService.activeMissions;
        if (!!selectedMissionTypes) {
            missions = missions.filter(mission => selectedMissionTypes.includes(mission.missionType));
        }
        return missions.filter(m => m.venue.idStarSystem === system.idStarSystem);
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

    missionTypeChange() {
        this.selectedMissionTypes = this.chipList._chips
            .filter(chip => chip.selected)
            .map(chip => <MissionTypeEnum>chip.value);
    }
}
