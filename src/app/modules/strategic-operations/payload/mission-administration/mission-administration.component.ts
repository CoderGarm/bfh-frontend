import {AfterViewInit, Component} from '@angular/core';
import {MissionCommunicationService} from "../../../../services/intercom/mission-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {Mission, StarSystem} from "../../../../services/swagger";
import {interval} from "rxjs";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {NgxSpinnerService} from "ngx-spinner";
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

    private static honorverseMapPath: string = 'https://map.battleforhonor.de';

    private static path: string = 'external-star-map';

    url?: SafeUrl;

    colorGroups: ColorGroup[] = [];

    centerCoord?: Coords;

    message: string = 'loading mission map ...';

    constructor(protected missionCommService: MissionCommunicationService,
                private spinner: NgxSpinnerService,
                private sanitizer: DomSanitizer) {
        super();
    }

    ngAfterViewInit(): void {

        this.spinner.show('mission-map');

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

    private colorizeMissionMap() {
        const mainStarSystemId: number = this.missionCommService.planets.filter(p => p.isMain).map(p => p.idStarSystem)[0];
        this.centerCoord = this.getCoordFromSystem(mainStarSystemId);

        const starSystemIDs: number[] = this.missionCommService.planets.map(p => p.idStarSystem);
        const colonizedSystems: StarSystem[] = this.missionCommService.systems.filter(sys => sys.idStarSystem != mainStarSystemId && starSystemIDs.includes(sys.idStarSystem));
        const colonized = colonizedSystems.map(sys => {
            return <ColorGroup>{
                color: 'green',
                coords: this.getCoordsFromOrbit(sys),
                simpleCoords: this.getCoordsFromOrbit(sys)
            }
        });

        const missions = this.missionCommService.activeMissions.map(mission => {
            return <ColorGroup>{
                color: this.getColor(mission.missionType),
                coords: this.getSystemCoordsFromMission(mission),
                simpleCoords: this.getSystemCoordsFromMission(mission)
            }
        });

        this.colorGroups = [...colonized, ...missions];
        this.buildURL();
    }

    private getCoordFromSystem(mainStarSystemId: number): Coords {
        const mainSystem: StarSystem = this.missionCommService.systems.filter(sys => sys.idStarSystem == mainStarSystemId)[0];
        return {
            x: mainSystem.orbit.xCoordinate.coordinate,
            y: mainSystem.orbit.yCoordinate.coordinate,
            name: mainSystem.name
        }
    }

    private buildURL() {
        if (this.missionCommService.planets.length == 0) {
            return;
        }
        let center = JSON.stringify(this.centerCoord, function (key, val) {
            if (key !== "name")
                return val;
        });
        let highlight = JSON.stringify(this.colorGroups, function (key, val) {
            if (key !== "coords")
                return val;
        });
        const urlString: string = MissionAdministrationComponent.honorverseMapPath + '/' + MissionAdministrationComponent.path + '?highlight=' + encodeURIComponent(highlight) + '&center=' + encodeURIComponent(center);
        this.url = this.transform(urlString);
        this.spinner.hide('mission-map');
    }

    private transform(url: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
}
