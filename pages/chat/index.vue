<template>
  <v-layout id="chatter" column fill-height align-center style="flex-wrap: nowrap;">
    <v-menu offset-y open-on-hover>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" outlined class="mb-3">線上人數：{{onlineUsers.length}}</v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(user, index) in onlineUsers" :key="index">
          <v-list-item-title>{{ user }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-list two-line class="msgArea">
      <div class="allMsg px-3">
        <div v-for="(msg, idx) in messages" :key="idx">
          <div class="message_block my-2" :class="{'self': user == msg.user}">
            <v-list-item-content>
              <v-list-item-title>{{msg.user}} 說：</v-list-item-title>
              <v-list-item-subtitle class="sended_msg" v-html="msg.message"></v-list-item-subtitle>
            </v-list-item-content>
          </div>
          <v-divider></v-divider>
        </div>
        <v-layout row align-center justify-end class="mt-3" v-if="sending">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-layout>
      </div>
    </v-list>

    <div class="px-2 textBox" :class="{'fix': focus}">
      <v-btn icon color="cyan" dark @click="imgModal = true" class="mr-2">
        <v-icon>insert_photo</v-icon>
      </v-btn>
      <v-textarea
        :label="user"
        placeholder="說點什麼吧"
        v-model="sendMessage"
        rows="2"
        class="textarea_box py-3"
        @focus="focus = true"
        @blur="focus = false"
        @keyup="typeIn"
        :hint="$vuetify.breakpoint.mdAndUp ? '同時按下 Ctrl + Enter 可直接送出' : ''"
        no-resize
      ></v-textarea>
      <v-btn icon color="primary" @click="send" class="ml-2">
        <v-icon>send</v-icon>
      </v-btn>
    </div>

    <v-dialog
      v-model="imgModal"
      persistent
      scrollable
      max-width="500px"
      transition="dialog-transition"
      class="py-3"
    >
      <v-card>
        <v-card-text>
          <div v-show="imgPreviewSrc != ''">
            <v-layout row wrap>
              <v-flex xs12>
                <v-img :src="imgPreviewSrc" @error="imgPreviewSrc = ''"></v-img>
              </v-flex>
            </v-layout>
          </div>
          <v-responsive v-show="imgPreviewSrc == ''" :aspect-ratio="4/3">
            <v-layout justify-center align-center fill-height>迷 u 圖片</v-layout>
          </v-responsive>
        </v-card-text>
        <v-card-actions>
          <v-layout column>
            <v-btn
              @click="sendImg"
              color="primary"
              class="mb-3"
              v-show="imgPreviewSrc != ''"
            >就 4 這張!</v-btn>
            <v-layout row justify-center>
              <v-btn color="primary" tag="label">
                {{imgPreviewSrc == '' ? '上傳圖片' : '換一張圖好惹'}}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  @change="setImg('local', $event)"
                />
              </v-btn>
              <v-btn @click="imgModal = false" color="error" outlined>算惹還是不要傳好惹</v-btn>
            </v-layout>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="userNameModal" persistent max-width="500px" transition="dialog-transition">
      <v-card class="py-10">
        <v-card-text class="pb-0">
          <v-form ref="form" @submit.prevent>
            <v-text-field
              outlined
              class="px-3"
              label="先來取個暱稱吧"
              name="user"
              v-model="newUserName"
              @keyup.enter="setUserName"
              :rules="[v => !!v || '不是沒有名字吧！']"
              :required="true"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="py-0">
          <v-layout justify-center>
            <v-btn color="primary" @click="setUserName">加入！</v-btn>
            <v-btn color="primary" outlined @click="enterAnonymous">我害羞我想匿名</v-btn>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog" :overlay="false" max-width="500px" transition="dialog-transition">
      <v-card>
        <v-card-text>{{ dialogMessage }}</v-card-text>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import io from "socket.io-client";

var nameStore = [
  "水獺",
  "野豬",
  "銀狐",
  "企鵝",
  "白虎",
  "蝙蝠",
  "雪貂",
  "蜥蜴",
  "烏龜",
  "恐龍",
  "麒麟",
  "水牛",
  "橘貓",
  "兔子",
  "喵喵",
  "大象",
  "猩猩",
  "香菇",
  "水生獸"
];

export default {
  name: "chatter",
  head: {
    title: "聊起來啊"
  },
  data() {
    return {
      socket: null,
      dialog: false,
      dialogMessage: "",
      dark: false,
      focus: false,
      userNameModal: true,
      imgModal: false,
      showUsers: false,
      sending: false,
      imgUrl: "",
      imgLocalUrl: "",
      imgPreviewSrc: "",
      newUserName: "",
      user: "",
      sendMessage: "",
      onlineUsers: [],
      messages: []
    };
  },
  mounted() {
    this.socket = io();
    const vm = this;
    this.socket.on("EFB_init-send-user-list", onlineUsers => {
      vm.onlineUsers = onlineUsers;
    });
    this.socket.on("EFB_message", msgdata => {
      vm.receive(msgdata);
    });
    this.socket.on("EFB_user-in", resData => {
      vm.userIn(resData);
    });
    this.socket.on("EFB_user-out", resData => {
      vm.userOut(resData);
    });
    this.socket.on("EFB_anonymous-in", resData => {
      vm.setAnonymousName(resData);
    });
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("beforeunload", () => {
      vm.socket.emit("EFC_user-out", this.user);
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    this.socket.emit("EFC_user-out", this.user);
  },
  methods: {
    handleResize() {
      // console.log(window.innerHeight)
    },
    enterAnonymous() {
      const vm = this;
      if (vm.onlineUsers.length == nameStore) {
        this.dialogMessage = "匿名名字庫不夠用了啦!取一個名字啦!";
        this.dialog = true;
        return;
      }
      let name =
        "匿名" + nameStore[Math.floor(Math.random() * nameStore.length)];

      function checkDuplicateName() {
        for (let i = 0; i < vm.onlineUsers.length; i++) {
          if (vm.onlineUsers[i] == name) {
            name =
              "匿名" + nameStore[Math.floor(Math.random() * nameStore.length)];
            checkDuplicateName();
            break;
          }
        }
      }
      checkDuplicateName();
      vm.user = name;
      vm.socket.emit("EFC_anonymous-in", vm.user);
      vm.userNameModal = false;
    },
    setAnonymousName({ onlineUsers, userName }) {
      this.receive({ user: "系統", message: `${userName} 害羞的飄了進來！！` });
      this.onlineUsers = onlineUsers;
    },
    setUserName() {
      if (this.$refs.form.validate()) {
        const vm = this;
        for (let i = 0; i < vm.onlineUsers.length; i++) {
          if (vm.onlineUsers[i] == vm.newUserName) {
            vm.dialogMessage = "名字重複啦!換一個吧!";
            vm.dialog = true;
            return;
          }
        }
        this.socket.emit("EFC_user-in", this.newUserName);
        this.userNameModal = false;
      }
    },
    change() {
      this.modal = true;
    },
    sendImg() {
      this.sending = true;
      var usr = this.user;
      this.socket.emit("EFC_message", {
        user: usr,
        type: "img",
        message: this.imgPreviewSrc
      });
      this.imgUrl = "";
      this.imgLocalUrl = "";
      this.imgPreviewSrc = "";
      this.imgModal = false;
    },
    setImg(type, e) {
      if (type == "url") {
        this.imgLocalUrl = "";
        this.imgPreviewSrc = this.imgUrl;
      }
      if (type == "local") {
        this.imgUrl = "";
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            this.imgLocalUrl = reader.result;
            this.imgPreviewSrc = reader.result;
          },
          false
        );
        if (file) {
          reader.readAsDataURL(file);
        }
      }
    },
    send() {
      this.sending = true;
      var usr = this.user;
      var msg = this.sendMessage;
      if (msg != "") {
        if (/^https:\/\/|^http:\/\//.test(msg.trim())) {
          this.socket.emit("EFC_message", {
            user: usr,
            type: "url",
            message: msg
          });
        } else {
          this.socket.emit("EFC_message", {
            user: usr,
            type: "text",
            message: msg
          });
        }
        this.sendMessage = "";
      }
      this.sending = false;
    },
    userIn({ onlineUsers, userName }) {
      this.receive({ user: "系統", message: `${userName} 衝了進來！！` });
      this.user = userName;
      this.onlineUsers = onlineUsers;
    },
    userOut({ onlineUsers, userName }) {
      this.receive({ user: "系統", message: `${userName} 離開了大家` });
      this.onlineUsers = onlineUsers;
    },
    receive(msgdata) {
      this.sending = false;
      if (msgdata.type == "img") {
        msgdata.message = `<img style="max-width:100%;max-height:40vh" src="${msgdata.message}" />`;
      }
      this.messages.push(msgdata);
      $(".msgArea").animate({ scrollTop: $(".allMsg").height() }, 500);
    },
    typeIn(e) {
      if (e.code == "Enter" && e.ctrlKey) {
        this.send();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$tablet: "screen and (max-width: 992px)";

* {
  -webkit-overflow-scrolling: touch;
}

img {
  max-width: 100% !important;
}

.chat-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  .v-content__wrap {
    width: 100%;
    max-width: 880px;
    display: flex;
    flex-wrap: wrap;
  }
}

.textBox {
  position: absolute;
  bottom: 0;
  justify-self: flex-end;
  max-height: 15vh;
  max-width: 880px;
  width: 100%;
  display: flex;
  align-items: center;
  &.fix {
    position: fixed;
    bottom: 0;
    background-color: #fff;
    .v-label {
      background-color: #fff;
    }
  }
}
.message_block {
  .v-list__item__content {
    height: auto !important;
  }
}

.msgArea {
  width: 100%;
  height: 100%;
  max-height: 72vh;
  overflow-y: hidden;
  &::-webkit-scrollbar {
    width: 0px;
  }
  &:hover {
    overflow-y: scroll;
  }
  @media #{$tablet} {
    overflow-y: scroll;
  }
}

.self .v-list-item__content * {
  text-align: right !important;
  color: #2ca42c;
}

.sended_msg {
  white-space: pre-wrap;
}

.textarea_box {
  overflow: hidden;
}
</style>
