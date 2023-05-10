import {Injectable} from '@angular/core';
import {ReplaySubject} from "rxjs";

/**
 * If scroll must be hidden at mat drawer for a specific component.
 */
@Injectable()
export class DoNotScrollService {

    private noScrollEmitter: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    getNoScrollEmitter() {
        return this.noScrollEmitter;
    }

    setNoScroll(hideScrollbar: boolean) {
        this.noScrollEmitter.next(hideScrollbar);
    }

    clearScrolling() {
        this.noScrollEmitter.next(false);
    }
}
