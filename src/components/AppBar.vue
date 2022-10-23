<template>
  <nav>
    <v-app-bar
      app
      color="red darken-3"
      dark
    >
      <v-app-bar-nav-icon @click="drawer.open = !drawer.open">

      </v-app-bar-nav-icon>

      <v-toolbar-title>
        <router-link to='/' class="toolbar-title">
            <v-icon left>mdi-hand-heart</v-icon>xdrip-supported
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>


      <v-btn text x-large id="btn-sign_out" @click="signout()" v-if="signed_in">Sign Out <v-icon right>logout</v-icon></v-btn>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer.open">
      <v-list>
        <v-list-item-group v-model="drawer.selected_item">
          <v-list-item 
            v-for="(item, i) in drawer.items"
            :key="i"
            :to="item.path"
            @click="drawer.open = false"
          >
            <v-list-item-icon>
              <v-icon v-text="item.icon" color="red accent-2"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>

          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>



<script>

export default {
  name: 'AppBar',

  created() {
    var vm = this;

    this.$firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        vm.signed_in = true;
      } else {
        vm.signed_in = false;
      }
    });
  },

  methods: {
    signout() {
      this.$firebase.auth().signOut().then(function() {
        //console.log("Signed out");
      }).catch(function(error) {
        console.log("ERR during sign out", error);
      });
    }
  },

  data: () => ({
    drawer: {
      open: false,
      items: [
        {
          title: 'Home',
          path: '/',
          icon: 'mdi-home'
        },
        {
          title: 'Sign In / Sign Up',
          path: '/auth',
          icon: 'mdi-login'
        }
      ],
      selected_item: 0
    },
    signed_in: false
  }),
};
</script>

<style scoped>
  .toolbar-title {
    color: inherit;
    text-decoration: inherit;
  }
</style>