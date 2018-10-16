import { Component } from '@angular/core';
import * as StompJs from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private stompClient;

  public messages: string[];

  constructor() {
    this.messages = [];
    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection() {
    // const ws = new SockJS(this.serverUrl);

    // const stompClient = new StompJs.Client();
    // stompClient.brokerURL = 'ws://localhost:8888/socket';

    this.stompClient = new StompJs.Client({
      brokerURL: 'ws://localhost:8081/socket',
      connectHeaders: {
        login: '',
        passcode: ''
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });
    console.log(this.stompClient)

    if (typeof WebSocket !== 'function') {
      // For SockJS you need to set a factory that creates a new SockJS instance
      // to be used for each (re)connect
      this.stompClient.webSocketFactory = function () {
        // Note that the URL is different from the WebSocket URL
        return new SockJS('http://localhost:8080/socket');
      };
    }

    const that = this;

    const callback = function(message) {
      // called when the client receives a STOMP message from the server
      if (message.body) {
        console.log(message.body);
        that.messages.push(message.body);
        // alert('got message with body ' + message.body)
      } else {
        // alert('got empty message');
      }
    };


    this.stompClient.onConnect = function(frame) {
      // Do something, all subscribes must be done is this callback
      // This is needed because this will be executed after a (re)connect
      const subscription = that.stompClient.subscribe('/notify', callback);
    };

    this.stompClient.onStompError = function (frame) {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
    };
    this.stompClient.activate();
  }

  sendMessage(message) {
    this.stompClient.publish({destination: '/app/send/message', body: message});
  }
}
