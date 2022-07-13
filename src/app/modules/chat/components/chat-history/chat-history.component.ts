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

    myUserID: number = -1;

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

    private msgIndexFrom = -1;
    private msgIndexTo = -1;

    constructor(private chatApi: ChatApiService, private tokenStorage: TokenStorage) {
        super();
    }

    isScrollingNeeded() {
        let heightOfMessageContainer = this.getHeightOfMessageContainer();
        let realHeightOfMessages = this.getRealHeightOfMessages();
        return realHeightOfMessages > heightOfMessageContainer;
    }

    ngOnInit(): void {
        this.myUserID = this.tokenStorage.getUserID();
    }

    private setWheelDown() {
        const msgContainer = document.getElementById('message-container');
        if (!msgContainer) {
            return
        }
        let from = this.msgIndexFrom;
        let to = this.msgIndexTo;
        if (msgContainer.offsetHeight + msgContainer.scrollTop >= msgContainer.scrollHeight) {
            // scroll reaches the bottom of the message container
            if (!!this.chatHistory && to < this.chatHistory?.messages.length - 1) {
                if (this.isScrollingNeeded()) {
                    from += 1;
                }
                to += 1;
            }
            this.setMessagesWithPaging(from, to);
        }
    }

    private setWheelUp() {
        const msgContainer = document.getElementById('message-container');
        if (!msgContainer) {
            return
        }
        let from = this.msgIndexFrom;
        let to = this.msgIndexTo;
        if (msgContainer.scrollTop == 0) {
            // scroll reaches the top of the message container
            if (!!this.chatHistory && this.msgIndexFrom > 0) {
                from -= 1;
                to -= 1;
            }
            this.setMessagesWithPaging(from, to);
        }
    }

    @HostListener('window:wheel', ['$event'])
    isScrolledIntoView(event: WheelEvent) {
        if (event.deltaY < 0) {
            // do nothing when scroll up
            this.setWheelUp();
            return;
        }

        this.setWheelDown();
        if (this.chatCardList) {
            this.chatCardList.forEach(element => {
                let footer: HTMLCollection = element.nativeElement.getElementsByTagName('mat-card-footer');
                let chatMessageId = footer[0].getAttribute("lang");
                this.markAsReceived(chatMessageId!);
            });
        }
    }

    private getHeightOfMessageContainer() {
        const msgContainer = document.getElementById('message-container');
        return msgContainer!.offsetHeight;
    }

    private getRealHeightOfMessages() {
        let neededHeight = 0;
        this.chatCardList!.forEach(element => {
            let rect = element.nativeElement.getBoundingClientRect();
            neededHeight += (rect.height + 15); //15px for margin-top
        });
        return neededHeight;
    }

    /**
     * Marks the message as read and fakes the receivedAt timestamp here in order to display the message not as unread.
     */
    markAsReceived(chatMessageId: string) {
        const idChatMessage = Number.parseFloat(chatMessageId);
        const chatMessage: ChatMessage | undefined = this.messages.find(msg => msg.idUserMessage == idChatMessage);
        const chatMessageFromLibrary: ChatMessage | undefined = this.chatHistory?.messages.find(msg => msg.idUserMessage == idChatMessage);
        if (!!chatMessageFromLibrary && !!chatMessageFromLibrary.receivedAt) {
            // do not trigger mark as read if already known as read
            return;
        }
        const sub = this.chatApi.markMessageRead(idChatMessage).subscribe(resp => {
            if (resp && !!chatMessageFromLibrary) {
                // mark it read in a transient way
                if (!!chatMessageFromLibrary) {
                    chatMessageFromLibrary.receivedAt = new Date();
                }
                if (!!chatMessage) {
                    chatMessage.receivedAt = new Date();
                }
            }
        });
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.selectedUserDefinition]) {
            if (!!this.selectedUserChatHistoryInput && !!this.selectedUserChatHistoryInput.idUser) {
                const subscription = this.chatApi.getChatByUsers(this.selectedUserChatHistoryInput.idUser)
                    .subscribe(resp => {
                        this.setChatHistory(resp);
                        this.setMessagesWithPaging(0, 4);

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

    private setMessagesWithPaging(from: number, to: number) {
        if (this.msgIndexFrom == from && this.msgIndexTo == to) {
            return;
        }
        if (!this.chatHistory) {
            return;
        }
        const messages = this.chatHistory.messages;
        const result: ChatMessage[] = [];
        for (let i = from; i <= to; i++) {
            result.push(messages[i]);
        }
        this.messages = result;
        this.msgIndexFrom = from;
        this.msgIndexTo = to;
    }
}
