<template>
  <div>
    <Navbar />
    <HeroSection />
    <PotentialRoommates />
    <SmartMatching />
    <StepsToMatch />
    <UserTestimonials />
    <CTASection />
  </div>
</template>

<script>
import HeroSection from '../components/HeroSection.vue'
import PotentialRoommates from '../components/PotentialRoommates.vue'
import SmartMatching from '../components/SmartMatching.vue'
import StepsToMatch from '../components/StepsToMatch.vue'
import UserTestimonials from '../components/UserTestimonials.vue'
import CTASection from '../components/CTASection.vue'
import Navbar from '../components/Home_Navbar.vue'

export default {
  components: {
    Navbar,
    HeroSection,
    PotentialRoommates,
    SmartMatching,
    StepsToMatch,
    UserTestimonials,
    CTASection
    
  }
}
</script>