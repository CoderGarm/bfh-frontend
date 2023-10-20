import {EventEmitter, Injectable} from "@angular/core";
import {CreateForumThread, Forum, ForumApiService} from "../../services/swagger";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class ForumsCommunicationService {

    selectedForum?: Forum;

    private deselectThreadEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
    private createdThreadEmitter: EventEmitter<CreateForumThread> = new EventEmitter<CreateForumThread>();

    constructor(private forumService: ForumApiService) {
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

    // both arrays will be constructed with new data on load forum messages component
    unreadMessages: number[] = [];
    markAsRead: number[] = [];

    markMessagesRead() {
        const allReadEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
        if (this.markAsRead.length == 0) {
            setTimeout(() => {
                allReadEmitter.emit(true);
            }, 200);
        }

        const toMarkAsRead = this.markAsRead.filter(idForumMessage => this.unreadMessages.includes(idForumMessage));
        toMarkAsRead.forEach(idForumMessage =>
            this.forumService.markForumMessageRead({idMessage: idForumMessage}).subscribe(() => {
                const indexOf = this.markAsRead.indexOf(idForumMessage);
                this.markAsRead.splice(indexOf, 1);
                if (this.markAsRead.length == 0) {
                    allReadEmitter.emit(true);
                }
            }));
        return allReadEmitter;
    }
}
