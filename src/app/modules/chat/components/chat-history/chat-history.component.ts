import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {ChatApiService, ChatHistory, ChatMessage, UserJson} from "../../../../services/swagger";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {interval, Subscription} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {take} from "rxjs/operators";
import {AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
    selector: 'app-chat-history',
    templateUrl: './chat-history.component.html',
    styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent extends SubscriptionManager implements OnInit, OnChanges {

    myUserID: number = -1;

    private readonly intervalPeriod = 30;

    /**
     * The current displayed chat history.
     */
    chatHistory?: ChatHistory;
    isNewChat: boolean = false;

    messages: ChatMessage[] = [];

    chatFG: FormGroup = new FormGroup({
        messageFC: new FormControl('')
    });

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

    private msgStartIndexFrom = 0;
    private msgStartIndexTo = 4;
    private msgIndexFrom = -1;
    private msgIndexTo = -1;
    private readonly writeYourMessage = 'Write your message...';
    editorConfig: AngularEditorConfig = {
        editable: false,
        placeholder: this.writeYourMessage,
        showToolbar: false,
        enableToolbar: false,
        sanitize: true
    };

    constructor(private chatApi: ChatApiService, private tokenStorage: TokenStorage) {
        super();
    }

    ngOnInit(): void {
        this.myUserID = this.tokenStorage.getUserID();
    }

    @HostListener('window:wheel', ['$event'])
    isScrolledIntoView(wheelEvent: WheelEvent) {
        if (wheelEvent.deltaY < 0) {
            this.wheelUp(false);
        } else {
            this.wheelDown(false);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.selectedUserDefinition]) {
            if (!!this.selectedUserChatHistoryInput && !!this.selectedUserChatHistoryInput.idUser) {
                const subscription = this.chatApi.getChatByUsers(this.selectedUserChatHistoryInput.idUser)
                    .subscribe(resp => {
                        this.setChatHistory(resp);
                        this.displayInitialMessages();
                        this.editorConfig.editable = !!this.chatHistory;
                        this.editorConfig.placeholder = this.getPlaceholder();
                    });
                this.subscriptions.push(subscription);
            }
        }
    }

    private getPlaceholder() {
        return this.writeYourMessage + ' to ' + this.selectedUserChatHistoryInput?.username;
    }

    private displayInitialMessages() {
        if (!this.chatHistory) {
            return;
        }

        let from = this.msgStartIndexFrom;
        let to = this.msgStartIndexTo;
        let length = this.chatHistory.messages.length;
        if (length > this.msgStartIndexTo) {
            // more messages present than initial start index
            to = length - 1;
            from = to - this.msgStartIndexTo;
        } else if (length <= this.msgStartIndexTo) {
            from = 0;
            to = length - 1;
        }
        this.setMessagesWithPaging(from, to); // displayInitialMessages
        // force scroll down for the case that message is too high for normal mechanism
        this.maxDown();
    }

    private wheelDown(isForced: boolean) {
        const msgContainer = document.getElementById('message-container');

        if (!msgContainer) {
            return
        }
        let from = this.msgIndexFrom;
        let to = this.msgIndexTo;
        let updateByHeightNeeded = msgContainer.offsetHeight + msgContainer.scrollTop >= msgContainer.scrollHeight;
        if (isForced || updateByHeightNeeded) {
            // scroll reaches the bottom of the message container
            if (!!this.chatHistory && to < this.chatHistory.messages.length - 1) {
                from += 1;
                to += 1;
            }
            this.setMessagesWithPaging(from, to); // wheelDown
        }
        this.markAllDisplayedMessagesAsRead();
    }

    private wheelUp(force: boolean) {
        const msgContainer = document.getElementById('message-container');
        if (!msgContainer) {
            return
        }
        let from = this.msgIndexFrom;
        let to = this.msgIndexTo;
        if (force || msgContainer.scrollTop == 0) {
            // scroll reaches the top of the message container
            if (!!this.chatHistory && this.msgIndexFrom > 0) {
                from -= 1;
                to -= 1;
            }
            this.setMessagesWithPaging(from, to); // wheelUp
        }
    }

    private markAllDisplayedMessagesAsRead() {
        if (!!this.chatCardList && !!this.chatHistory) {
            let isUnreadPresent: ChatMessage | undefined = this.chatHistory.messages.find(msg => !msg.receivedAt);
            if (!isUnreadPresent) {
                // nothing to mark as read
                return;
            }
            this.chatCardList.forEach(element => {
                let footer: HTMLCollection = element.nativeElement.getElementsByTagName('mat-card-footer');
                let chatMessageId = footer[0].getAttribute("lang");
                this.markAsReceived(chatMessageId!);
            });
        }
    }

    /**
     * Marks the message as read and fakes the receivedAt timestamp here in order to display the message not as unread.
     */
    markAsReceived(chatMessageId: string) {
        if (!this.chatHistory) {
            return;
        }
        const idChatMessage = Number.parseFloat(chatMessageId);
        const chatMessage: ChatMessage | undefined = this.messages.find(msg => msg.idUserMessage == idChatMessage);
        const chatMessageFromLibrary: ChatMessage | undefined = this.chatHistory.messages.find(msg => msg.idUserMessage == idChatMessage);
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

    chooseStyleFromSender(message: ChatMessage): string {
        let sender: UserJson = message.sender
        let userID: number = this.tokenStorage.getUserID();
        if (sender.idUser === userID) {
            return "chat-card set-right " + message.idUserMessage;
        }
        return "chat-card set-left " + message.idUserMessage;
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
                .subscribe(resp => {
                    this.setChatHistory(resp);
                    this.displayInitialMessages();
                });
            this.subscriptions.push(sub);
        }
        this.chatFG.controls.messageFC.setValue('');
    }

    private setChatHistory(resp: ChatHistory | undefined) {
        if (!this.selectedUserChatHistoryInput) {
            return;
        }
        if (!!resp) {
            this.chatHistory = resp;
            this.isNewChat = false;
        } else {
            this.isNewChat = true;
            this.chatHistory = {
                userOne: {
                    idUser: this.myUserID,
                    username: this.tokenStorage.getLogin()
                },
                userTwo: this.selectedUserChatHistoryInput,
                messages: []
            };
        }
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

    /**
     * Unused, I know. But interesting.
     */
    isScrollingNeeded() {
        let heightOfMessageContainer = this.getHeightOfMessageContainer();
        let realHeightOfMessages = this.getRealHeightOfMessages();
        return realHeightOfMessages > heightOfMessageContainer;
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

    displayPreviousMessageArrow() {
        if (!this.chatHistory) {
            return false;
        }
        return this.msgIndexFrom > 0;
    }

    displayNextMessageArrow() {
        if (!this.chatHistory) {
            return false;
        }
        const lastMessageNotLoaded = this.msgIndexTo != (this.chatHistory.messages.length - 1);
        const msgContainer = document.getElementById('message-container');
        if (!msgContainer) {
            return false;
        }
        let scrollEndReached = msgContainer.scrollHeight - msgContainer.offsetHeight == msgContainer.scrollTop;
        return lastMessageNotLoaded || !scrollEndReached;
    }

    maxUp() {
        if (!this.chatHistory) {
            return;
        }
        const source = interval(this.intervalPeriod);
        let counter = this.msgIndexFrom;
        let numberObservable = source.pipe(take(this.msgIndexFrom));
        let sub = numberObservable.subscribe(() => {
            this.wheelUp(true);
            counter--;
            if (counter == 0) {
                // force scroll down for the case that message is too high for normal mechanism
                this.scrollUp();
            }
        });
        this.subscriptions.push(sub);
    }

    maxDown() {
        if (!this.chatHistory) {
            return;
        }
        const source = interval(this.intervalPeriod);
        let scrollTimes = this.chatHistory.messages.length - this.msgIndexTo;
        let counter = scrollTimes;
        let numberObservable = source.pipe(take(scrollTimes));
        let sub = numberObservable.subscribe(() => {
            this.wheelDown(true);
            counter--;
            if (counter == 0) {
                // force scroll down for the case that message is too high for normal mechanism
                this.scrollDown();
            }
        });
        this.subscriptions.push(sub);
    }

    private scrollDown() {
        const msgContainer = document.getElementById('message-container');
        if (!!msgContainer) {
            msgContainer.scrollTop = msgContainer.scrollHeight;
        }
    }

    private scrollUp() {
        const msgContainer = document.getElementById('message-container');
        if (!!msgContainer) {
            msgContainer.scrollTop = 0;
        }
    }
}
