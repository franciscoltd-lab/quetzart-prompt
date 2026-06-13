import { Component, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { MessagesApiService } from 'src/app/core/api/messages-api.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnDestroy {
  conversations: any[] = [];
  messages: any[] = [];
  selected?: any;
  draft = '';
  private socket?: WebSocket;

  constructor(
    public auth: AuthService,
    private messagesApi: MessagesApiService,
    private toastCtrl: ToastController
  ) {}

  ionViewDidEnter() {
    this.loadConversations();
  }

  ngOnDestroy() {
    this.socket?.close();
  }

  get currentUserId() {
    try {
      const token = this.auth.getToken() || '';
      return Number(JSON.parse(atob(token.split('.')[1] || '')).sub);
    } catch {
      return 0;
    }
  }

  loadConversations() {
    if (!this.auth.isLoggedIn()) return;
    this.messagesApi.listConversations().subscribe({
      next: (rows) => {
        this.conversations = rows || [];
        if (!this.selected && this.conversations.length) {
          this.selectConversation(this.conversations[0]);
        }
      },
    });
  }

  selectConversation(conversation: any) {
    this.selected = conversation;
    this.socket?.close();
    this.messagesApi.listMessages(conversation.id).subscribe({
      next: (rows) => {
        this.messages = rows || [];
        this.openSocket(conversation.id);
      },
    });
  }

  send() {
    const body = this.draft.trim();
    if (!body || !this.selected) return;

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ body }));
      this.draft = '';
      return;
    }

    this.messagesApi.sendMessage(this.selected.id, body).subscribe({
      next: (message) => {
        this.messages = [...this.messages, message];
        this.draft = '';
      },
    });
  }

  private openSocket(conversationId: number) {
    this.socket = this.messagesApi.openSocket(conversationId);
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messages = [...this.messages, message];
      this.loadConversations();
    };
    this.socket.onerror = async () => {
      const toast = await this.toastCtrl.create({
        message: 'No se pudo conectar el chat en tiempo real.',
        duration: 1400,
        position: 'bottom',
      });
      await toast.present();
    };
  }
}
