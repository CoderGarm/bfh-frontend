import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {CreateForumThread, Forum} from "../../../../services/swagger";
import {ForumsNotificationService} from "../../forums-notification.service";
import {SubscriptionManager} from "../../../../SubscriptionManager";

@Component({
    selector: 'app-create-forum-thread',
    templateUrl: './create-forum-thread.component.html',
    styleUrls: ['./create-forum-thread.component.scss']
})
export class CreateForumThreadComponent extends SubscriptionManager implements OnInit {

    @Input()
    selectedForum?: Forum;

    newThreadFG: FormGroup = new FormGroup({
        newThreadsTitle: new FormControl(''),
        newThreadsDescription: new FormControl(''),
        firstMessage: new FormControl(''),
    });

    constructor(@Optional() @Inject('selectedForum') selectedForum: Forum | undefined,
                private forumsNotificationService: ForumsNotificationService) {
        super();
        this.selectedForum = selectedForum;
    }

    ngOnInit(): void {
        this.newThreadFG.valueChanges.subscribe(value => {
            console.log("fire")
            this.forumsNotificationService.pushCreatedThread(this.createThread());
        });
    }

    createThread(): CreateForumThread | undefined {
        let result: CreateForumThread | undefined;
        if (!!this.selectedForum) {
            result = {
                idForum: this.selectedForum.idForum,
                title: this.newThreadFG.controls.newThreadsTitle.value,
                description: this.newThreadFG.controls.newThreadsDescription.value,
                firstMessage: this.newThreadFG.controls.firstMessage.value
            };
        }
        console.log("result", result)
        return result;
    }
}
