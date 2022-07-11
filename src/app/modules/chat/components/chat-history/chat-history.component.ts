import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {ChatApiService, ChatHistory, ChatMessage, UserJson} from "../../../../services/swagger";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {Subscription} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {SubscriptionManager} from "../../../../SubscriptionManager";

@Component({
    selector: 'app-chat-history',
    templateUrl: './chat-history.component.html',
    styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent extends SubscriptionManager implements OnInit, OnChanges {

    /**
     * The current displayed chat history.
     */
    chatHistory?: ChatHistory;

    messages: ChatMessage[] = [];

    chatFG: FormGroup = new FormGroup({
        messageFC: new FormControl('')
    })

    /**
     * The user which was selected by the logged in user in order to chat with.
     * And their field name below - which must be the same in order to address the field.
     */
    @Input()
    selectedUserChatHistoryInput?: UserJson;
    private selectedUserDefinition: string = 'selectedUserChatHistoryInput';

    @Output()
    newChatStartedChatHistoryOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChildren("chatCardList", {read: ElementRef})
    chatCardList?: QueryList<ElementRef>;

    constructor(private chatApi: ChatApiService, private tokenStorage: TokenStorage) {
        super();
    }

    @HostListener('window:wheel', ['$event'])
    isScrolledIntoView(event: WheelEvent) {
        //this.messages = this.getPagingFromMessages(0, 2);
        console.log(event)
        if (event.deltaY < 0) {
            console.log("scroll up")
        } else {
            console.log("scroll down")
        }


        if (this.chatCardList) {
            let neededHeight = 0;
            this.chatCardList.forEach(element => {
                let rect = element.nativeElement.getBoundingClientRect();
                neededHeight += (rect.height + 15); //15px for margin-top
            });
            console.log("heigth", neededHeight) // todo how to detect what is in viewport?

            //console.log("---------------------------------------------------")
            /*const rect = this.chatCardList.nativeElement.getBoundingClientRect();
            const topShown = rect.top >= 0;
            const bottomShown = rect.bottom <= window.innerHeight;
            this.isTestDivScrolledIntoView = topShown && bottomShown;*/
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // only run when property "user" changed
        if (changes[this.selectedUserDefinition]) {
            if (!!this.selectedUserChatHistoryInput && !!this.selectedUserChatHistoryInput.idUser) {
                const subscription = this.chatApi.getChatByUsers(this.selectedUserChatHistoryInput.idUser)
                    .subscribe(resp => {
                        this.setChatHistory(resp);
                        this.messages = this.getPagingFromMessages(0, 2);
                    });
                this.subscriptions.push(subscription);
            }
        }
    }

    chooseStyleFromSender(sender: UserJson): string {
        let userID: number = this.tokenStorage.getUserID();
        if (sender.idUser === userID) {
            return "chat-card set-right";
        }
        return "chat-card set-left";
    }

    submitMessage() {
        if (!this.selectedUserChatHistoryInput) {
            return;
        }
        // check if this is a new chat or only a new message for an old one
        const idChatHistory: number = !!this.chatHistory?.idChatHistory ? this.chatHistory.idChatHistory : -1;

        const chatMessage: ChatMessage = {
            idUserMessage: this.chatHistory?.idChatHistory,
            message: this.chatFG.controls.messageFC.value,
            sender: {
                idUser: this.tokenStorage.getUserID(),
                username: this.tokenStorage.getLogin(),
                role: this.tokenStorage.getRole()
            },
            sentAt: new Date()
        };

        if (!!idChatHistory && idChatHistory != -1) {
            // add a new message to an old chat
            const sub: Subscription = this.chatApi.sendChatMessage(chatMessage)
                .subscribe(resp => this.setChatHistory(resp));
            this.subscriptions.push(sub);
        } else {
            // create a new chat
            const chatHistory: ChatHistory = {
                idChatHistory: idChatHistory,
                userOne: {
                    idUser: this.tokenStorage.getUserID(),
                    username: this.tokenStorage.getLogin(),
                    role: this.tokenStorage.getRole()
                },
                userTwo: this.selectedUserChatHistoryInput!,
                messages: [chatMessage],
            }
            const sub: Subscription = this.chatApi.createChatMessageThread(chatHistory)
                .subscribe(resp => this.setChatHistory(resp));
            this.subscriptions.push(sub);
        }
        this.chatFG.controls.messageFC.setValue('');
    }

    private setChatHistory(resp: ChatHistory) {
        this.chatHistory = resp;
    }

    private getPagingFromMessages(from: number, to: number) {
        if (!this.chatHistory) {
            return [];
        }
        const messages = this.chatHistory.messages;
        const result: ChatMessage[] = [];
        for (let i = from; i <= to; i++) {
            result.push(messages[i]);
        }
        return result;
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    chooseStyleByChat() {
        if (!!this.chatHistory && !!this.chatHistory.messages && this.chatHistory.messages.length > 6) {
            //return "chat-card set-right message-field-in-flow";
        } else {
            //return "chat-card set-right message-field-on-hold";
        }
        return "chat-card set-right write-card message-field-in-flow";
    }
}
