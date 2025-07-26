<template>
  <div class="profile-section">
    <div class="box">
      <h2>Personal Information</h2>
      <p>Update your personal details and contact information.</p>

      <form class="form-grid" @submit.prevent="saveProfile">
        <div class="input-group first">
          <input type="text" placeholder="Name" v-model="profile.firstName" />
        </div>
      
        <div class="input-group email">
          <input type="email" placeholder="Email" v-model="profile.email" />
        </div>
        <div class="input-group phone">
          <div class="phone-field">
            <select v-model="profile.phoneCountryCode">
              <option value="+66">+66</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+61">+61</option>
              <option value="+81">+81</option>
            </select>
            <input type="text" placeholder="Phone" v-model="profile.phoneNumber" />
          </div>
        </div>

        <div class="input-group dob">
          <input type="date" v-model="profile.dob" />
        </div>
        <div class="input-group gender">
          <select v-model="profile.gender">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            </select>
        </div>
        <div class="input-group nationality">
          <select v-model="profile.nationality">
            <option value="">Nationality</option>
            <option value="cambodia">Cambodia</option>
            <option value="china">China</option>
            <option value="myanmar">Myanmar</option>
            <option value="thailand">Thailand</option>
          </select>
        </div>
        <div class="bio-group bio">
          <textarea placeholder="Bio" v-model="profile.bio"></textarea>
        </div>
        <div class="input-group school">
          <input type="text" placeholder="School/ University" v-model="profile.school" />
        </div>
        <div class="input-group major">
          <input type="text" placeholder="Major/ Field of study" v-model="profile.major" />
        </div>
      


      </form>
    </div>
    <div class="box">
      <div class="box-header">
        <h2>Account Settings</h2>
        <hr />
      </div>
      <div class="setting-row">
        <span>Email Notification</span>
        <label class="switch">
          <input type="checkbox" v-model="profile.emailNotifications" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <span>Profile Visibility</span>
        <label class="switch">
          <input type="checkbox" v-model="profile.profileVisibility" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <span>Location Sharing</span>
        <label class="switch">
          <input type="checkbox" v-model="profile.locationSharing" />
          <span class="slider"></span>
        </label>
      </div>
      <button class="save-btn" @click="saveProfile">Save Changes</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PersonalInfo",
  data() {
    return {
      profile: {
        firstName: "",
        email: "",
        phoneCountryCode: "+66",
        phoneNumber: "",
        dob: "",
        gender: "",
        nationality:"",
        bio: "",
        school: "",
        major: "",
        hasRoom: false,
        emailNotifications: true,
        profileVisibility: true,
        locationSharing: true,
      },
    };
  },
  methods: {
    saveProfile() {
      console.log("Profile saved:", this.profile);
      alert("Profile saved successfully!");
      //replace this with an API call
    },
  },
};
</script>

<style scoped>
.profile-section {
  margin-top: 1rem;
}

.box {
  background: #e6fff1;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

h2 {
  color: #1b9536;
  margin-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 300px 300px;
  grid-template-areas:
    "first first"
    "email nationality"
    "phone phone"
    "dob gender"
    "bio bio"
    "school major";
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.first {
  grid-area: first;
}


.email {
  grid-area: email;
}

.phone {
  grid-area: phone;
}

.phone-field {
  display: flex;
  gap: 0.5rem;
}

.phone-field select {
  width: 90px;
  padding: 0.6rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.phone-field input {
  flex: 1;
}

.dob {
  grid-area: dob;
}

.gender {
  grid-area: gender;
}

.nationality{
  grid-area: nationality;
}
.gender select {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.bio {
  grid-area: bio;
}

.school {
  grid-area: school;
}

.major {
  grid-area: major;
}

.input-group,
.bio-group {
  display: flex;
  flex-direction: column;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

textarea {
  min-height: 100px;
}

.box-header {
  margin-top: -0.5rem;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 20px;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.4s;
}

.switch input:checked + .slider {
  background-color: #1b9536;
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
}

.save-btn {
  background: #1b9536;
  color: white;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1.5rem;
}

.checkbox-group {
  grid-column: span 0;
  display: flex;
  align-items: center;
  margin-top: -1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #333;
  gap: 0.5rem;
  font-weight: 500;
}

</style>

