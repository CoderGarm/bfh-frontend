import {Injectable} from "@angular/core";
import {Tick} from "../swagger";
import {ReplaySubject} from "rxjs";

@Injectable()
export class CurrentTickService {

    currentTick?: Tick;

    readonly tickEmitter: ReplaySubject<Tick> = new ReplaySubject<Tick>();

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
