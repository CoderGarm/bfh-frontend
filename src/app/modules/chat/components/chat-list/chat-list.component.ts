import {ChatApiService, ChatHistory, UserApiService, UserJson} from '../../../../services/swagger';
import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Subscription} from "rxjs";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {FormControl, FormGroup} from "@angular/forms";


@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements AfterViewInit, OnChanges {

    /**
     * Holds every user which is not part of an active chat, not the logged in user but found by the search-by-username.
     */
    foundPossibleChatPartners: UserJson[] = [];

    /**
     * Holds every partner who is part of an active chat.
     */
    knownChatPartners: UserJson[] = [];

    /**
     * Holds every active chat.
     */
    activeChats: ChatHistory[] = []

    private subscriptions?: Subscription[];

    userSearchFromGroup: FormGroup = new FormGroup({
        searchUserNameFC: new FormControl('')
    })

    /**
     * The user which was selected by the logged in user in order to chat with.
     */
    @Output()
    selectedUserChatListOutput: EventEmitter<UserJson> = new EventEmitter<UserJson>();

    /**
     * Event which is fired if a new chat was started in order to update the list of active chats.
     * And their field name below - which must be the same in order to address the field.
     */
    @Input()
    newChatStartedChatListInput?: boolean;
    private newChatPartnerDefinition: string = 'newChatStartedChatListInput';

    private myUserID?: number;

    constructor(private userApi: UserApiService,
                private chatApi: ChatApiService,
                private tokenStorage: TokenStorage) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.newChatPartnerDefinition]) {
            const sub: Subscription = this.chatApi.getChatByUser(this.tokenStorage.getUserID()).subscribe(resp => {
                this.activeChats = resp != null ? resp : [];
                this.createListOfKnownChatPartners();
            })
            sub.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        this.myUserID = this.tokenStorage.getUserID();

        const sub: Subscription = this.chatApi.getChatByUser(this.tokenStorage.getUserID()).subscribe(resp => {
            this.activeChats = resp != null ? resp : [];
            this.createListOfKnownChatPartners();
        })
        this.subscriptions?.push(sub);

        this.userSearchFromGroup.controls.searchUserNameFC.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(change => {
            const sub: Subscription = this.userApi.getUsersByLikeUserName(change).subscribe(resp => {

                resp = this.removeAlreadyKnownChatPartners(resp);
                resp = this.removeLoggedInUserFromListOfChatPartners(resp)
                this.foundPossibleChatPartners = resp
            });
            this.subscriptions?.push(sub);
        });
    }

    private removeAlreadyKnownChatPartners(resp: UserJson[]): UserJson[] {
        const knownIdUsers: number[] = this.knownChatPartners.map(user => user.idUser);
        const newIdUsers: number[] = resp.map(user => user.idUser);
        const idsToRemove: number[] = newIdUsers.filter(id => knownIdUsers.includes(id));

        resp.forEach(user => {
            if (idsToRemove.includes(user.idUser)) {
                let indexOfToRemove = resp.indexOf(user);
                resp.splice(indexOfToRemove, 1)
            }
        });
        return resp;
    }

    private removeLoggedInUserFromListOfChatPartners(resp: UserJson[]): UserJson[] {
        let loggedInUserID = this.tokenStorage.getUserID();
        let find: UserJson | undefined = resp.find(x => x.idUser == loggedInUserID);
        if (!!find) {
            resp.splice(resp.indexOf(find), 1);
        }
        return resp;
    }

    private createListOfKnownChatPartners() {
        this.knownChatPartners = this.activeChats
            .map(chat => this.getPartnerFromChat(chat))
            .sort((a, b) => {
                if (a!.username < b!.username) {
                    return -1;
                }
                if (a!.username > b!.username) {
                    return 1;
                }
                return 0;
            }).filter(user => user!) as UserJson[];
    }

    private getPartnerFromChat(chatHistory: ChatHistory): UserJson | undefined {
        if (!!this.myUserID) {
            return chatHistory.userOne.idUser === this.myUserID ? chatHistory.userTwo : chatHistory.userOne;
        }
        return undefined;
    }

    displayChatHistoryBetweenMeAnd(chatPartner?: UserJson) {
        if (!!chatPartner) {
            this.selectedUserChatListOutput.emit(chatPartner!);
        }
    }

    ngOnDestroy() {
        this.subscriptions?.forEach(subscription => subscription.unsubscribe());
    }
}
