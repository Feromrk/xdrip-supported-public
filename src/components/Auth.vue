<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      
      <v-flex
        xs12
        mb-5
      >
        <div class="headline font-weight-bold mt-12" v-if="signed_in"><v-icon x-large>mdi-check</v-icon> Signed in!</div>
        <div class="headline font-weight-bold" v-if="!signed_in">Sign in / sign up here:</div>
        <div class="caption mt-2" v-if="!signed_in"><v-icon>mdi-alert-circle</v-icon> We rely on 3rd party cookies for authentication,<br> we do not use them for any other purposes.</div>

        <div id="firebaseui-auth-container" v-if="!signed_in"></div>

      </v-flex>


    </v-layout>
  </v-container>
</template>

<script>
import * as firebaseui from "firebaseui";


export default {
  name: 'Auth',

  data: () => ({
    signed_in: false,
  }),

  methods: {

  },

  mounted() {

  var vm = this;
  
  var ui = firebaseui.auth.AuthUI.getInstance();

  if(!ui) {
    ui = new firebaseui.auth.AuthUI(this.$firebase.auth());
  }

  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) { // eslint-disable-line no-unused-vars
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.

        if(authResult.additionalUserInfo.isNewUser) {
          vm.$analytics.logEvent('sign_up', {
            method: authResult.additionalUserInfo.providerId,
          });
        }

        vm.$analytics.logEvent('login', {
          method: authResult.additionalUserInfo.providerId,
        });

        window.location.assign('/');
        return false;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        //document.getElementById('loader').style.display = 'none';
      }
    },  
    signInFlow: 'popup',
    //signInSuccessUrl: '/',//'https://' + this.$firebase.$app.options.authDomain + '/home',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      this.$firebase.auth.EmailAuthProvider.PROVIDER_ID,
      this.$firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      this.$firebase.auth.GithubAuthProvider.PROVIDER_ID,
      this.$firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    // Terms of service url.
    tosUrl: window.location.origin + vm.$router.resolve({name: 'termsOfService'}).href,
    // Privacy policy url.
    privacyPolicyUrl: window.location.origin + vm.$router.resolve({name: 'privacyPolicy'}).href
    };

    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);


    vm.$firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("AUTH STATE CHANGED TO SINGED IN")
        vm.signed_in = true;
      } else {
        console.log("AUTH STATE CHANGED TO SINGED OUT")
        vm.signed_in = false;
        ui.reset();
        ui.start('#firebaseui-auth-container', uiConfig);
      }
    });

  }

};
</script>

<style scoped>
  @import "https://www.gstatic.com/firebasejs/ui/4.4.0/firebase-ui-auth.css";
</style>