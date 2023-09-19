import {EventEmitter, Injectable} from "@angular/core";
import {CreateForumThread, Forum} from "../../services/swagger";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class ForumsNotificationService {

    selectedForum?: Forum;

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
        this.createdThreadEmitter.emit(thread);
    }

    public askCreatedThread() {
        return this.createdThreadEmitter;
    }
}
