<template>
  <div class="preferences-section">
    <div class="box">
      <h2>Roommate Preferences</h2>
      <p>Set your ideal roommate preferences and requirements.</p>

      <div class="field-box">
        <label class="heading">Preferred Gender</label>
        <div class="radio-group vertical">
          <label class="select">
            <input
              type="radio"
              name="gender"
              value="any"
              v-model="preferences.gender"
            />
            Any
          </label>
          <label class="select">
            <input
              type="radio"
              name="gender"
              value="male"
              v-model="preferences.gender"
            />
            Male
          </label>
          <label class="select">
            <input
              type="radio"
              name="gender"
              value="female"
              v-model="preferences.gender"
            />
            Female
          </label>
          <label class="select">
            <input
              type="radio"
              name="gender"
              value="nonbinary"
              v-model="preferences.gender"
            />
            Non-Binary
          </label>
          <label class="select">
            <input
              type="radio"
              name="gender"
              value="other"
              v-model="preferences.gender"
            />
            Other
          </label>
          <label class="select">
            <input
              type="radio"
              name="gender"
              value="preferNotToSay"
              v-model="preferences.gender"
            />
            Prefer not to say
          </label>
        </div>
      </div>

      <div class="field-box">
        <label class="heading">Age Range</label>
        <div class="input-row">
          <input
            type="number"
            placeholder="Min Age"
            v-model="preferences.minAge"
          />
          <input
            type="number"
            placeholder="Max Age"
            v-model="preferences.maxAge"
          />
        </div>
      </div>

      <div class="field-box">
        <label class="heading">Budget Range (per month)</label>
        <input
          type="text"
          placeholder="e.g. $500 - $700"
          v-model="preferences.budgetRange"
        />
      </div>

      <div class="field-box">
        <label class="heading">Smoking</label>
        <select v-model="preferences.smoking">
          <option value="">Select preference</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="sometimes">Sometimes</option>
        </select>
      </div>

      <div class="field-box">
        <label class="heading">Overnight Guests</label>
        <select v-model="preferences.overnightGuests">
          <option value="">Select preference</option>
          <option value="allowed">Allowed</option>
          <option value="notAllowed">Not Allowed</option>
          <option value="sometimes">Sometimes</option>
        </select>
      </div>
    </div>

    <div class="box">
      <h2>Location Preference</h2>

      <div class="field-box">
        <label class="heading">Preferred Location</label>
        <input
          type="text"
          placeholder="e.g. University District"
          v-model="preferences.preferredLocation"
        />
      </div>

      <div class="field-box">
        <label class="heading">Maximum Distance from Campus (km)</label>
        <input
          type="number"
          placeholder="Distance in km"
          v-model="preferences.maxDistance"
        />
      </div>

      <div class="field-box">
        <label class="heading">Transportation Preferences</label>
        <div class="checkbox-group vertical">
          <label class="select">
            <input
              type="checkbox"
              value="publicTransport"
              v-model="preferences.transportation"
            />
            Near public transportation
          </label>
          <label class="select">
            <input
              type="checkbox"
              value="walking"
              v-model="preferences.transportation"
            />
            Walking distance to campus
          </label>
          <label class="select">
            <input
              type="checkbox"
              value="ownTransport"
              v-model="preferences.transportation"
            />
            Own transportation available
          </label>
        </div>
      </div>
    </div>

    <button class="save-btn" @click="savePreferences">Save Preferences</button>
  </div>
</template>

<script>
export default {
  name: "Preferences",
  data() {
    return {
      preferences: {
        gender: "",
        minAge: "",
        maxAge: "",
        budgetRange: "",
        smoking: "",
        overnightGuests: "",
        preferredLocation: "",
        maxDistance: "",
        transportation: [],
      },
    };
  },
  methods: {
    savePreferences() {
      console.log("Preferences saved:", this.preferences);
      alert("Preferences saved successfully!");
    },
  },
};
</script>

<style scoped>
.preferences-section {
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

p {
  margin-bottom: 1rem;
  color: #333;
}

.field-box {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.heading {
  font-weight: 600;
  color: #1b9536;
  margin-bottom: 0.5rem;
  display: block;
}

.select {
  font-weight: 600;
  color: #474747;
  margin-bottom: 0.5rem;
  display: block;
}

.radio-group.vertical {
  flex-direction: column;
  gap: 0.3rem;
  display: flex;
}

.checkbox-group.vertical {
  flex-direction: column;
  gap: 0.3rem;
  display: flex;
}

.input-row {
  display: flex;
  gap: 1rem;
}

input,
select {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
}

.save-btn {
  background: #1b9536;
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1.5rem;
}
</style>
