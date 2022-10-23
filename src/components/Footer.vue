<template>
  <v-card >
    <v-footer
      class="font-weight-light text-small text-center"
    >
    

    <v-row dense>
      <v-col cols="3">
        &copy; {{ new Date().getFullYear() }} — xdrip-supported
      </v-col>
      <v-col>
        <router-link to="termsOfService">Terms Of Service</router-link>
      </v-col>
      <v-col>
        <router-link to="privacyPolicy">Privacy Policy</router-link>
      </v-col>
      <v-col>
        <router-link to="cookiesPolicy">Cookies Policy</router-link>
      </v-col>
    </v-row>
      
    </v-footer>
  </v-card>
</template>

<script>


export default {
  name: 'Footer',

  data: () => ({
    //
  }),

};
</script>

<style scoped>
  .text-small {
    font-size: 11px;
  }
</style>