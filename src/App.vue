<template>
  <v-app>
    <AppBar/>

    <v-content>

      <keep-alive include="home">
        <router-view></router-view>
      </keep-alive>

    </v-content>

    <Footer/>
    
  </v-app>
</template>

<script>
import AppBar from './components/AppBar'
import Footer from './components/Footer'

export default {
  name: 'App',

  components: {
    AppBar,
    Footer
  },

  data: () => ({
    //
  }),
};
</script>
