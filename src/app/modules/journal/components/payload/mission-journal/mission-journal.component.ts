import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ConvoyRaidActionItemGroup, MissionReport, PirateRaidActionItemGroup} from "../../../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";


@Component({
    selector: 'app-mission-journal',
    templateUrl: './mission-journal.component.html',
    styleUrls: ['./mission-journal.component.scss']
})
export class MissionJournalComponent implements OnChanges {

    @Input()
    missionResults?: MissionReport;

    missionItems: (ConvoyRaidActionItemGroup | PirateRaidActionItemGroup)[] = [];

    constructor(private translate: TranslateService) {

        // make sure they are part of the translation
        this.translate.get('mission.PIRATE_RAID.title');
        this.translate.get('mission.PIRATE_RAID.detection-phrase');
        this.translate.get('mission.PIRATE_RAID.phase.SPAWN');
        this.translate.get('mission.PIRATE_RAID.phase.APPROACH');
        this.translate.get('mission.PIRATE_RAID.phase.WITHDRAW');
        this.translate.get('mission.PIRATE_RAID.phase.LEAVE_ORBIT');
        this.translate.get('mission.PIRATE_RAID.phase.RAID');
        this.translate.get('mission.PIRATE_RAID.phase.BATTLE');
        this.translate.get('mission.PIRATE_RAID.phase.WAIT');
        this.translate.get('mission.PIRATE_RAID.phase.NO_BATTLE');

        this.translate.get('mission.PIRATE_RAID.phase.multi.SPAWN-APPROACH');
        this.translate.get('mission.PIRATE_RAID.phase.multi.SPAWN-WITHDRAW');
        this.translate.get('mission.PIRATE_RAID.phase.multi.SPAWN-WAIT');

        this.translate.get('mission.PIRATE_RAID.phase.multi.BATTLE-RAID');
        this.translate.get('mission.PIRATE_RAID.phase.multi.BATTLE-RAID-LEAVE_ORBIT');
        this.translate.get('mission.PIRATE_RAID.phase.multi.NO_BATTLE-RAID');
        this.translate.get('mission.PIRATE_RAID.phase.multi.NO_BATTLE-RAID-LEAVE_ORBIT');

        this.translate.get('mission.convoy.attack.predicate.BEGIN_OF_MISSION');
        this.translate.get('mission.convoy.attack.predicate.END_OF_MISSION');
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log(this.missionResults)
        this.missionResults?.actionItemGroups.forEach(item => this.missionItems.push(item));
        this.missionResults?.convoyActionItemGroups.forEach(item => this.missionItems.push(item));
    }
}
