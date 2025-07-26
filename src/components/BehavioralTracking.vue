<template>
  <div class="behavioral-section">
    <div class="box">
      <h2>Manual Behavioral Tracking</h2>
      <p>Manually input your behavior patterns if you prefer not to use automatic tracking.</p>

      <div class="field-box">
        <label>Typical Sleep Schedule</label>
        <div class="input-row">
          <select v-model="behavior.bedtime">
            <option disabled value="">Bedtime</option>
            <option>10:00 PM</option>
            <option>11:00 PM</option>
            <option>12:00 AM</option>
            <option>1:00 AM</option>
            <option>2:00 AM</option>
          </select>
          <select v-model="behavior.waketime">
            <option disabled value="">Wake time</option>
            <option>5:00 AM</option>
            <option>6:00 AM</option>
            <option>7:00 AM</option>
            <option>8:00 AM</option>
            <option>9:00 AM</option>
          </select>
        </div>
      </div>

      <div class="field-box">
        <label>Noise Preferences</label>
        <div class="radio-group vertical">
          <label>
            <input
              type="radio"
              value="quiet"
              v-model="behavior.noisePreference"
            />
            I prefer a quiet environment
          </label>
          <label>
            <input
              type="radio"
              value="moderate"
              v-model="behavior.noisePreference"
            />
            I'm okay with moderate noise
          </label>
          <label>
            <input
              type="radio"
              value="loud"
              v-model="behavior.noisePreference"
            />
            I don't mind louder environments
          </label>
        </div>
      </div>

      <div class="field-box">
        <label>Utility Usage</label>
        <div class="utility-grid">
          <div class="utility-field">
            <label>Electricity Usage</label>
            <select v-model="behavior.electricityUsage">
              <option disabled value="">Select</option>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </div>
          <div class="utility-field">
            <label>Water Usage</label>
            <select v-model="behavior.waterUsage">
              <option disabled value="">Select</option>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </div>
          <div class="utility-field">
            <label>Temperature Preference</label>
            <input
              type="number"
              v-model="behavior.temperature"
              placeholder="e.g. 25°C"
            />
          </div>
        </div>
      </div>

      <button class="btn-primary" @click="saveChanges">Save Changes</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "BehavioralTracking",
  data() {
    return {
      behavior: {
        bedtime: "",
        waketime: "",
        noisePreference: "",
        electricityUsage: "",
        waterUsage: "",
        temperature: "",
      },
    };
  },
  methods: {
    saveChanges() {
      console.log("Behavioral data saved:", this.behavior);
      alert("Behavioral data saved!");
      // here you'd call an API or emit to parent
    },
  },
};
</script>

<style scoped>
.behavioral-section {
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

.field-box label {
  font-weight: 600;
  color: #1b9536;
  margin-bottom: 0.5rem;
  display: block;
}

.radio-group.vertical {
  display: 100%;
  flex-direction: column;
  gap: 0.5rem;

  align-items: flex-start;

}

.radio-group.vertical label {
  display: flex;
  align-items: center;
  
  font-weight: normal;
}

.utility-grid {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.utility-field {
  display: flex;
  flex-direction: column;
}

select,
input {
  width: 100%;
  max-width: 300px;
  padding: 0.7rem;
  border: 1px solid #1b9536;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
}

.input-row{
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
}

.btn-primary {
  background: #1b9536;
  color: white;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}
</style>


