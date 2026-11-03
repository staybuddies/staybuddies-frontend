<template>
  <div>
    <a class="skip-link" href="#page-content">Skip to content</a>
    <div id="page-content" tabindex="-1"><router-view /></div>
    <Footer />
  </div>
</template>

<script>
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {Footer}
  
}
</script>