<template>
  <v-app>
    <div>
    <v-app-bar dark dense app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title></v-toolbar-title>

      <v-spacer></v-spacer>
    </v-app-bar>
    </div>
    <v-content>
      <v-container fill-height>
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer
      app
      :src="require('@/assets/image/sticker.png')"
      contain
      v-model="drawer"
    >
      <v-list>
        <v-list-item
          v-for="([icon, text, to], i) in draweritems"
          :key="i"
          :to="to"
          @click="drawer = false"
          color="primary"
        >
          <v-list-item-icon>
            <v-icon>{{ icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: false,
      draweritems: [
        ['home', 'Home', '/'],
        ['message', 'Chat', '/chat'],
      ],
    };
  }
};
</script>
