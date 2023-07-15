import {Component, Input} from '@angular/core';
import {MissionActionItem, MissionActionItemGroup, MissionReport} from "../../../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";
import EMissionActionEnum = MissionActionItem.EMissionActionEnum;

@Component({
    selector: 'app-mission-journal',
    templateUrl: './mission-journal.component.html',
    styleUrls: ['./mission-journal.component.scss']
})
export class MissionJournalComponent {

    @Input()
    missionResults?: MissionReport;

    validPhases: string[] = [
        [EMissionActionEnum.SPAWN, EMissionActionEnum.APPROACH].join('.'),
        [EMissionActionEnum.SPAWN, EMissionActionEnum.WITHDRAW].join('.'),
        [EMissionActionEnum.SPAWN, EMissionActionEnum.WAIT].join('.'),
        [EMissionActionEnum.SPAWN, EMissionActionEnum.APPROACH].join('.'),
        [EMissionActionEnum.BATTLE, EMissionActionEnum.RAID].join('.'),
        [EMissionActionEnum.BATTLE, EMissionActionEnum.RAID, EMissionActionEnum.LEAVE_ORBIT].join('.'),
        [EMissionActionEnum.NO_BATTLE, EMissionActionEnum.RAID].join('.'),
        [EMissionActionEnum.NO_BATTLE, EMissionActionEnum.RAID, EMissionActionEnum.LEAVE_ORBIT].join('.'),
    ]

    constructor(private translate: TranslateService) {

        // make sure they are part of the translation
        this.translate.get('mission.PIRATE_RAID.title')
        this.translate.get('mission.PIRATE_RAID.detection-phrase')
        this.translate.get('mission.PIRATE_RAID.phase.SPAWN')
        this.translate.get('mission.PIRATE_RAID.phase.APPROACH')
        this.translate.get('mission.PIRATE_RAID.phase.WITHDRAW')
        this.translate.get('mission.PIRATE_RAID.phase.LEAVE_ORBIT')
        this.translate.get('mission.PIRATE_RAID.phase.RAID')
        this.translate.get('mission.PIRATE_RAID.phase.BATTLE')
        this.translate.get('mission.PIRATE_RAID.phase.WAIT')
        this.translate.get('mission.PIRATE_RAID.phase.NO_BATTLE')

        this.translate.get('mission.PIRATE_RAID.phase.multi.SPAWN-APPROACH')
        this.translate.get('mission.PIRATE_RAID.phase.multi.SPAWN-WITHDRAW')
        this.translate.get('mission.PIRATE_RAID.phase.multi.SPAWN-WAIT')

        this.translate.get('mission.PIRATE_RAID.phase.multi.BATTLE-RAID')
        this.translate.get('mission.PIRATE_RAID.phase.multi.BATTLE-RAID-LEAVE_ORBIT')
        this.translate.get('mission.PIRATE_RAID.phase.multi.NO_BATTLE-RAID')
        this.translate.get('mission.PIRATE_RAID.phase.multi.NO_BATTLE-RAID-LEAVE_ORBIT')
    }

    getTranslationKey(actionGroup: MissionActionItemGroup) {
        return actionGroup.actionItems.map(i => i.eMissionAction).join('-');
    }

    t(actionGroup: MissionActionItemGroup) {
        const key = this.getTranslationKey(actionGroup);
        return this.translate.get('mission.PIRATE_RAID.phase.multi.' + key);
    }
}
