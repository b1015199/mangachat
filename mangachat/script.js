
//Vue.jsに則った書き方
let app = new Vue({
  el: '#app',

  // 初期化
  created: function () {

    // ユーザ名の設定
    let inputedUserName = window.prompt("マンガ×コミュニケーションへようこそ！\nユーザ名を入力してください", "");
    this.userName = inputedUserName
    this.first_display = true

    if(inputedUserName.length == 0){
        //var test_comsple = console.log("とおったよ");
        // 入力がなかった場合
        let dummyNameList = ['名無し漫画家1','名無し漫画家2','名無し漫画家3','名無し漫画家4', '名無し漫画家5', '名無し漫画家6', '名無し漫画家7', '名無し漫画家8', '名無し漫画家9'];
        // 漫画家1～9がランダムで割り当てられる
        this.userName =  dummyNameList[Math.floor(Math.random() * dummyNameList.length)];
    }

    // firebaseの設定
    this.setupFirebase()

    // chatの設定
    this.setupChat()

    // メッセージを読み込む
    this.loadMessage()

  },
  // ----------------------------------------

  // userのデータ
  data: {
    message: "",
    userName: "",
    userId: Math.random().toString(36).slice(-8),
    messageList: [],
    developerName: "Manga App team",
    developerSite: "",
    balloon_active: true,
    state: "ON",
    selected: "",
    first_display: false
  },
  // ----------------------------------------

  // 処理
  methods: {

    // Firebaseの設定
    setupFirebase: function(){
        var config = {
            apiKey: "自分のAPIキー",
            authDomain: "manga-d28ae.firebaseapp.com",
            databaseURL: "https://manga-d28ae.firebaseio.com",
            projectId: "manga-d28ae",
            storageBucket: "",
            messagingSenderId: "785571989379"
        };
        firebase.initializeApp(config);
    },
    // ----------------------------------------

    // チャット読み込み
    setupChat: function(){
        let ref = firebase.database().ref('chats')
        let hash = location.hash

        // chatId があったとき
        if(hash != null && hash.length > 0){
            let chatId = hash.slice( 1 ) ;
            this.chatRef = ref.child(chatId)
            console.log("read chat", chatId)
        }
        // なかったとき
        else{
            let createdAt = this.timestamp()

            // 新しいチャットを作って
            this.chatRef = ref.push()

            // 保存する
            this.chatRef.set({
                createdAt: createdAt
                , createdAtReverse: -createdAt
            })

            location.href = location.origin + location.pathname + "#" + this.chatRef.key
            console.log("create chat", this.chatRef.key)
        }
    },
    // ----------------------------------------

    // メッセージを送る
    send: function(event){ //eventは標準DOMイベント
        if(this.message.length == 0){
            return;
        }

        // 新しいメッセージを作って
        let messageRef = firebase.database().ref('messages').push()
        let createdAt = this.timestamp()
        let newMessage = this.message + this.selected
        const BREAK_INTERVAL = 20 //改行間隔

        // メッセージに改行タグを挿入
        /* word-breakに変更
        newMessage = this.insertBreak(newMessage, newMessage.length, '<br>', BREAK_INTERVAL)
        */

        // 保存する
        let chat = this.chatRef.key
        messageRef.set({
            chat: chat,
            message: newMessage,
            userName: this.userName,
            userId: this.userId,
            createdAt: createdAt,
            createdAtReverse: -createdAt,
            balloon: this.balloon_active
        })

        // 入力エリアリセット
        this.message = ""
    },

    // 改行タグ挿入用関数

    /*
    insertBreak: function(newMessage, length, breakcode, interval){
      var processedMessage = ""
      // 間隔文字数よりmessageの文字数が多いことが挿入条件
      if(length > interval){
        for(var i=0; i+interval<length; i+=interval){
          console.log("now i value is " + i + " and processedMessage is " + processedMessage)
          processedMessage += newMessage.slice(i,i+interval) + breakcode
          console.log("change processedMessage is "+processedMessage)
        }
        // 残りの文字列挿入
        processedMessage += newMessage.slice(i)
      }
      else processedMessage = newMessage

      return processedMessage
    },
    */

    // ----------------------------------------

    // メッセージを読み込む
    loadMessage:function(){
        let chatKey = this.chatRef.key
        let loadRef = firebase.database().ref("messages").orderByChild("chat").equalTo(chatKey)

        // 最初に全部取ってくる
        loadRef.once('value').then((snapshot) => {

            var messageList = []
            snapshot.forEach(function(childSnapshot) {
                var data = childSnapshot.val()
                data.key = childSnapshot.key
                messageList.push(data)
            })

            // 日付でソート
            messageList.sort(function(a,b){
                if( a.createdAt < b.createdAt ) return -1;
                if( a.createdAt > b.createdAt ) return 1;
                return 0;
            });

            // 表示に反映
            this.messageList = messageList

            // 追加の監視
            this.observeMessage()

            // 下までスクロール
            this.scrollToBottom()
        });
    },
    // ----------------------------------------

    // メッセージの監視
    observeMessage: function(){
        let chatKey = this.chatRef.key
        let chatRef = firebase.database().ref("messages").orderByChild("chat").equalTo(chatKey)
        chatRef.on("child_added", (snapshot) => {
            let newMessage = snapshot.val()
            newMessage.key = snapshot.key
            for(var i=0,max=this.messageList.length;i<max;i++) {
                let message = this.messageList[i]
                if(message.key == newMessage.key){
                    return
                }
            }

            // 表示に反映
            this.messageList.push(newMessage)
            this.scrollToBottom()
        })
    },
    // ----------------------------------------

    // 画面（最終更新部分）までスクロール
    scrollToBottom :function() {
        setTimeout(()=>{
            let height = Math.max(0, document.body.scrollHeight - document.body.clientHeight)
            anime({
                targets: "body",
                scrollTop: height,
                duration: 200,
                easing: "easeInQuad"
            });
        }, 100)
    },
    // ----------------------------------------

    // 自分のメッセージかどうか確認

    isMyMessage: function(message){
        return {
          mymessage: this.userId == message.userId
        }
    },
    // ----------------------------------------

    // フキダシの種類制御 this.messageはテキストエリア内の文字

    changeBalloon: function(message){
      let s = message.message
      return {
        //テキストによるフキダシ変更
        balloon_exclamation: (s.substr(s.length-1,s.length)=="！") || (s.substr(s.length-1,s.length)=="!"),
        balloon_fluffy: (s.substr(s.length-1,s.length)=="？") || (s.substr(s.length-1,s.length)=="?"),
        balloon_thought: ((s.substr(0,1)=="（") && (s.substr(s.length-1)=="）")) || ((s.substr(0,1)=="(") && (s.substr(s.length-1)==")")),
      }
    },

    // "フキダシ変更"が有効であるかどうか確認
    isBalloonActive: function(){
      this.balloon_active=!this.balloon_active
      this.state = this.balloon_active ? "ON":"OFF"
    },

    onMampu: function(message){
      let s = message.message
      return {
        //テキストによる漫符の表示
        //angry: (s.substr(s.length-3,s.length)=="（") && (s.substr(s.length-2,s.length)=="怒") && (s.substr(s.length-1,s.length)=="）"),
        angry: (s.substr(s.length-3,s.length)=="（怒）") || (s.substr(s.length-3,s.length)=="(怒)"),
        laugh: (s.substr(s.length-1,s.length)=="w") || (s.substr(s.length-1,s.length)=="ｗ") || (s.substr(s.length-3,s.length)=="（笑）") || (s.substr(s.length-3,s.length)=="(笑)"),
        guruguru: (s.substr(s.length-3,s.length)=="（困）") || (s.substr(s.length-3,s.length)=="(困)"),
        odoroki: (s.substr(s.length-2,s.length)=="!?") || (s.substr(s.length-2,s.length)=="！？") || (s.substr(s.length-2,s.length)=="?!") || (s.substr(s.length-2,s.length)=="？！")
      }
    },

    /*
    angryAnime: function() {
      anime({
        targets: '#angry',
        scale: {
          value: 2,
          delay: 200,
          duration: 1000,
          easing: 'easeInOutBounce'
        },loop: true
      });
    },
    */

    // メッセージ時間の処理
    displayTime: function(message) {
        let timestamp = message.createdAt * 1000
        var date = new Date(timestamp)

        // 0詰めするために頭に0を入れて2桁表示にしている
        return ("0"+date.getHours()).slice(-2) + ":" + ("0"+date.getMinutes()).slice(-2);
    },

    timestamp: function(){
        let date = new Date()
        let timestamp = date.getTime()
        return Math.floor( timestamp / 1000 )
    }
    // ----------------------------------------
  }
})
