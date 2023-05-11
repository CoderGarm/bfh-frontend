import {Injectable} from "@angular/core";
import {Tick} from "../swagger";

@Injectable()
export class CurrentTickService {

    currentTick?: Tick;

    getCurrentTick() {
        if (!this.currentTick) {
            throw new Error("There should be a tick.");
        }
        return this.currentTick;
    }

    setTick(tick: Tick) {
        this.currentTick = tick;
    }

    clear() {
        this.currentTick = undefined;
    }
}
