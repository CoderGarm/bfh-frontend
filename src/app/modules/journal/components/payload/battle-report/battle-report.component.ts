import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {timer} from "rxjs";
import {MatSlider} from "@angular/material/slider";
import {BattleRegisterService} from "../../../../../services/intercom/battle-register.service";

@Component({
    selector: 'app-battle-report',
    templateUrl: './battle-report.component.html',
    styleUrls: ['./battle-report.component.scss']
})
export class BattleReportComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'battle' // fixme rollback

    @ViewChild(MatSlider)
    matSlider?: MatSlider;

    constructor(protected battleRegisterService: BattleRegisterService) {
        super();

        this.battleRegisterService.noScrollService.setNoScroll();
    }

    ngOnDestroy() {
        this.battleRegisterService.noScrollService.clearScrolling();
        super.ngOnDestroy();
    }

    ngAfterViewInit(): void {
        this.battleRegisterService.fetchData();
    }

    play() {
        if (!this.battleRegisterService.combatArenaData) {
            return;
        }
        this.pause();
        if (this.battleRegisterService.activeRoundIndex == this.battleRegisterService.combatArenaData.combatRounds.length - 1) {
            this.fastRewind();
        }
        let numberObservable = timer(0, 100);
        this.battleRegisterService.combatRunSubscription = numberObservable.subscribe(() => this.innerNext(false));
        this.subscriptions.push(this.battleRegisterService.combatRunSubscription);
    }

    stop() {
        this.pause();
        this.fastRewind();
    }

    pause() {
        if (!!this.battleRegisterService.combatRunSubscription) {
            this.battleRegisterService.combatRunSubscription.unsubscribe();
            this.battleRegisterService.combatRunSubscription = undefined;
        }
    }

    fastRewind() {
        this.pause();
        if (this.battleRegisterService.activeRoundIndex == 0) {
            return;
        }
        this.battleRegisterService.activeRoundIndex = 0;
        this.battleRegisterService.setActiveRound();
    }

    fastForward() {
        if (!this.battleRegisterService.combatArenaData) {
            return;
        }
        this.pause();
        if (this.battleRegisterService.activeRoundIndex == this.battleRegisterService.combatArenaData.combatRounds.length - 1) {
            return;
        }
        this.battleRegisterService.activeRoundIndex = this.battleRegisterService.combatArenaData.combatRounds.length - 1;
        this.battleRegisterService.setActiveRound();
    }

    next() {
        this.pause();
        this.innerNext(true);
    }

    private innerNext(fastRewind: boolean) {
        if (!this.battleRegisterService.combatArenaData) {
            return;
        }
        let i: number = this.battleRegisterService.activeRoundIndex;
        if (++i >= this.battleRegisterService.combatArenaData.combatRounds.length) {
            if (fastRewind) {
                this.fastRewind();
            }
            return;
        }
        this.battleRegisterService.activeRoundIndex++;
        this.battleRegisterService.setActiveRound();
    }

    previous() {
        this.pause();
        let i: number = this.battleRegisterService.activeRoundIndex;
        if (--i < 0) {
            this.fastForward();
            return;
        }
        this.battleRegisterService.activeRoundIndex--;
        this.battleRegisterService.setActiveRound();
    }

    getLastRound() {
        if (!!this.battleRegisterService.combatArenaData && this.battleRegisterService.combatArenaData.combatRounds.length != 0) {
            return this.battleRegisterService.combatArenaData.combatRounds[this.battleRegisterService.combatArenaData.combatRounds.length - 1];
        }
        return 0;
    }

    formatLabel(value: number) {
        return '' + value;
    }

    slide(val: number | null) {
        this.battleRegisterService.activeRoundIndex = !!val ? val : 0;
        this.battleRegisterService.setActiveRound();
    }


}

