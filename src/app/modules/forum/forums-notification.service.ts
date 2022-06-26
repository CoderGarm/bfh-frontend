import {EventEmitter, Injectable} from "@angular/core";
import {CreateForumThread} from "../../services/swagger";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class ForumsNotificationService {

    private deselectThreadEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
    private createdThreadEmitter: EventEmitter<CreateForumThread> = new EventEmitter<CreateForumThread>();

    constructor() {
    }

    public pushDeselectThread() {
        this.deselectThreadEmitter.emit(true);
    }

    public askDeselectThread() {
        return this.deselectThreadEmitter;
    }


    public pushCreatedThread(thread: CreateForumThread | undefined) {
        console.log("event", thread)
        this.createdThreadEmitter.emit(thread);
    }

    public askCreatedThread() {
        return this.createdThreadEmitter;
    }
}
