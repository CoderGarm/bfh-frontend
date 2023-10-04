import {Injectable} from "@angular/core";
import {Tick} from "../swagger";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class CurrentTickService {

    currentTick?: Tick;

    readonly tickEmitter: BehaviorSubject<Tick | undefined> = new BehaviorSubject<Tick | undefined>(undefined);

    getCurrentTick() {
        if (!this.currentTick) {
            throw new Error("There should be a tick.");
        }
        return this.currentTick;
    }

    setTick(tick: Tick) {
        this.currentTick = tick;
        this.tickEmitter.next(this.currentTick);
    }

    clear() {
        this.currentTick = undefined;
    }
}
