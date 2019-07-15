<template>
  <v-layout id="chatter" column wrap fill-height>
    <v-toolbar app>
      <v-toolbar-title>CHAT IT UP</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" flat>線上人數：{{onlineUsers.length}}</v-btn>
          </template>
          <v-list>
            <v-list-tile v-for="(user, index) in onlineUsers" :key="index" @click>
              <v-list-tile-title>{{ user }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
        <v-btn icon @click="dark = !dark">
          <v-icon>invert_colors</v-icon>
        </v-btn>
        <!-- <v-btn color="primary" dark flat @click="change">改名稱</v-btn> -->
      </v-toolbar-items>
    </v-toolbar>
    <v-list two-line class="msgArea">
      <div class="allMsg px-3">
        <div v-for="(msg, idx) in messages" :key="idx">
          <div class="message_block my-2" :class="{'self' : user == msg.user}">
            <v-list-tile-content>
              <v-list-tile-title>{{msg.user}} 說：</v-list-tile-title>
              <v-list-tile-sub-title class="sended_msg" v-html="msg.message"></v-list-tile-sub-title>
            </v-list-tile-content>
          </div>
          <v-divider></v-divider>
        </div>
      </div>
    </v-list>

    <div class="px-2 textBox" :class="{'fix': focus}">
      <v-btn icon color="cyan" dark @click="imgModal = true">
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
      ></v-textarea>
      <v-btn icon color="primary" @click="send">
        <v-icon>send</v-icon>
      </v-btn>
    </div>

    <v-dialog
      v-model="imgModal"
      persistent
      max-width="500px"
      transition="dialog-transition"
      class="py-3"
    >
      <v-card>
        <v-text-field class="px-3" label="可以試試圖片連結" v-model="imgUrl" @change="setImg('url')"></v-text-field>

        <v-card-actions>
          <v-btn color="primary" tag="label" block>
            也可以試試本地檔案
            <input hidden type="file" accept="image/*" @change="setImg('local', $event)" />
          </v-btn>
        </v-card-actions>
        <div v-show="imgPreviewSrc != ''">
          <v-img :src="imgPreviewSrc" @error="imgPreviewSrc = ''"></v-img>
          <v-btn @click="sendImg" color="primary" block>就 4 這張!</v-btn>
        </div>
        <v-btn @click="imgModal = false" color="error" block flat>算惹還是不要傳好惹</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog v-model="userNameModal" persistent max-width="500px" transition="dialog-transition">
      <v-card>
        <v-form ref="form" @submit.prevent>
          <v-text-field
            class="px-3"
            label="先來取個暱稱吧"
            name="user"
            v-model="user"
            @keyup.enter="setUserName"
            :rules="[v => !!v || '不是沒有名字吧！']"
            :required="true"
          ></v-text-field>
        </v-form>
        <v-card-actions>
          <v-btn color="primary" block @click="setUserName">確認</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import io from "socket.io-client";

export default {
  name: "chatter",
  data() {
    return {
      socket: null,
      dark: false,
      focus: false,
      userNameModal: true,
      imgModal: false,
      showUsers: false,
      imgUrl: "",
      imgLocalUrl: "",
      imgPreviewSrc: "",
      user: "",
      sendMessage: "",
      onlineUsers: [],
      messages: []
    };
  },
  mounted() {
    this.socket = io();
    const vm = this;
    this.socket.on("EFB_message", function(msgdata) {
      vm.receive(msgdata);
    });
    this.socket.on("EFB_user-in", function(resData) {
      vm.userIn(resData.onlineUsers, resData.userName);
    });
    this.socket.on("EFB_user-out", function(resData) {
      vm.userOut(resData.onlineUsers, resData.userName);
    });
    $("body")[0].style.height = window.innerHeight + "px";
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    this.socket.emit("EFC_user-out", this.user);
  },
  methods: {
    handleResize() {
      // console.log(window.innerHeight)
    },
    setUserName() {
      if (this.$refs.form.validate()) {
        this.socket.emit("EFC_user-in", this.user);
        this.userNameModal = false;
      }
    },
    change() {
      this.modal = true;
    },
    sendImg() {
      var usr = this.user;
      var msg = `<img src="${this.imgPreviewSrc}" />`;
      this.socket.emit("EFC_message", { user: usr, message: msg });
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
      var usr = this.user;
      var msg = this.sendMessage;
      if (msg != "") {
        this.socket.emit("EFC_message", { user: usr, message: msg });
        this.sendMessage = "";
      }
    },
    userIn(onlineUsers, userName) {
      this.receive({ user: "系統", message: `${userName} 衝了進來！！` });
      this.onlineUsers = onlineUsers;
    },
    userOut(onlineUsers, userName) {
      this.receive({ user: "系統", message: `${userName} 離開了大家` });
      this.onlineUsers = onlineUsers;
    },
    receive(msgdata) {
      this.messages.push(msgdata);
      // $(".msgArea").animate({ scrollTop: $(".allMsg").height() }, 500);
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
  max-width: 100%;
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
  .v-list__tile__content {
    height: auto !important;
  }
}

.msgArea {
  width: 100%;
  height: 100%;
  max-height: 72vh;
  overflow-y: hidden;
  &:hover {
    overflow-y: scroll;
  }
  @media #{$tablet} {
    overflow-y: scroll;
  }
}

.self .v-list__tile__content * {
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
