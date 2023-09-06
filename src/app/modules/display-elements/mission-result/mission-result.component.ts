import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ConvoyRaidActionItemGroup, PirateRaidActionItem, PirateRaidActionItemGroup} from "../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";
import EMissionActionEnum = PirateRaidActionItem.EMissionActionEnum;

@Component({
    selector: 'app-mission-result',
    templateUrl: './mission-result.component.html',
    styleUrls: ['./mission-result.component.scss']
})
export class MissionResultComponent implements OnChanges {

    @Input()
    actionGroup?: ConvoyRaidActionItemGroup | PirateRaidActionItemGroup;

    convoyProtection?: ConvoyRaidActionItemGroup;
    pirateRaid?: PirateRaidActionItemGroup;

    validPhases: string[] = [
        [EMissionActionEnum.SPAWN, EMissionActionEnum.APPROACH].join('-'),
        [EMissionActionEnum.SPAWN, EMissionActionEnum.WITHDRAW].join('-'),
        [EMissionActionEnum.SPAWN, EMissionActionEnum.WAIT].join('-'),
        [EMissionActionEnum.SPAWN, EMissionActionEnum.APPROACH].join('-'),
        [EMissionActionEnum.BATTLE, EMissionActionEnum.RAID].join('-'),
        [EMissionActionEnum.BATTLE, EMissionActionEnum.RAID, EMissionActionEnum.LEAVE_ORBIT].join('-'),
        [EMissionActionEnum.NO_BATTLE, EMissionActionEnum.RAID].join('-'),
        [EMissionActionEnum.NO_BATTLE, EMissionActionEnum.RAID, EMissionActionEnum.LEAVE_ORBIT].join('-'),
    ]

    constructor(private translate: TranslateService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.actionGroup) {
            switch (this.actionGroup.missionType) {
                case "PIRATE_RAID":
                    this.pirateRaid = <PirateRaidActionItemGroup>this.actionGroup;
                    break;
                case "CONVOY_PROTECTION":
                    this.convoyProtection = <ConvoyRaidActionItemGroup>this.actionGroup;
                    break;
                case "PIRATE_HUNT":
                case "CONVOY_RAID":
                default:
                    break;
            }
        }
    }

    getTranslationKey(actionGroup: PirateRaidActionItemGroup) {
        return actionGroup.actionItems.map(i => i.eMissionAction).join('-');
    }

    t(actionGroup: PirateRaidActionItemGroup) {
        const key = this.getTranslationKey(actionGroup);
        return this.translate.get('mission.PIRATE_RAID.phase.multi.' + key);
    }
}
