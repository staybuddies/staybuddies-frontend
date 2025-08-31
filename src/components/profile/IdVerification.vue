<template>
  <div>
    <!-- EMAIL + OTP -->
    <div class="card idv-card">
      <div class="row-head">
        <h2>Email Verification</h2>
        <span v-if="schoolEmailVerified" class="badge ok">Verified</span>
        <span v-else class="badge warn">Not verified</span>
      </div>

      <div class="grid">
        <label class="span-2">
          Email
          <input
            v-model.trim="schoolEmail"
            type="email"
            placeholder="you@anydomain.com"
            :disabled="requestingOtp || confirmingOtp"
            @keyup.enter="requestOtp"
          />
          <small v-if="schoolEmail && !isValidEmail" class="error">
            Please enter a valid email address.
          </small>
        </label>

        <div class="span-2 actions-row">
          <button
            class="btn-ghost"
            @click.prevent="requestOtp"
            :disabled="requestingOtp || !isValidEmail"
            :title="!isValidEmail ? 'Enter a valid email' : ''"
          >
            {{ requestingOtp ? "Sending…" : "Send Code" }}
          </button>

          <input
            v-model.trim="otpCode"
            class="otp"
            maxlength="6"
            inputmode="numeric"
            pattern="\\d{6}"
            placeholder="6-digit code"
            :disabled="confirmingOtp"
          />

          <button
            class="btn-ghost"
            @click.prevent="confirmOtp"
            :disabled="confirmingOtp || otpCode.length !== 6"
          >
            {{ confirmingOtp ? "Verifying…" : "Verify" }}
          </button>
        </div>
      </div>

      <p class="muted small">
        We’ll email a one-time code to the address you enter.
      </p>
      <p v-if="otpStatus" class="small ok-text">{{ otpStatus }}</p>
      <p v-if="otpError" class="small error">{{ otpError }}</p>
    </div>

    <!-- STUDENT ID VERIFICATION (unchanged logic; keep if you use it) -->
    <div class="card idv-card">
      <div class="row-head">
        <h2>Student ID Card</h2>
        <span v-if="idv.status" :class="['pill', statusClass]">{{
          statusLabel
        }}</span>
      </div>

      <div v-if="!idv.id" class="start">
        <p class="muted">
          Start a verification to upload photos of your student ID (front/back)
          and an optional selfie.
        </p>
        <button
          class="primary"
          @click="createVerification"
          :disabled="idvLoading"
        >
          {{ idvLoading ? "Starting…" : "Start Verification" }}
        </button>
      </div>

      <div v-else>
        <div class="upload-grid">
          <div class="uploader">
            <div class="thumb" :style="bg(idv.frontUrl)">Front</div>
            <input
              type="file"
              accept="image/*"
              @change="onPick($event, 'front')"
            />
          </div>

          <div class="uploader">
            <div class="thumb" :style="bg(idv.backUrl)">Back</div>
            <input
              type="file"
              accept="image/*"
              @change="onPick($event, 'back')"
            />
          </div>

          <div class="uploader">
            <div class="thumb" :style="bg(idv.selfieUrl)">Selfie</div>
            <input
              type="file"
              accept="image/*"
              @change="onPick($event, 'selfie')"
            />
          </div>
        </div>

        <div class="actions-row">
          <button
            class="primary"
            @click="submitVerification"
            :disabled="submitting || !idv.id"
          >
            {{ submitting ? "Submitting…" : "Submit for Review" }}
          </button>
          <span class="muted" v-if="idv.status === 'REJECTED' && idv.note"
            >Reason: {{ idv.note }}</span
          >
        </div>

        <div class="result-grid" v-if="idv.status">
          <div>
            <strong>Score</strong>
            <div class="score">{{ idv.score ?? "—" }}</div>
          </div>
          <div>
            <strong>Name on card</strong>
            <div>{{ idv.nameOnCard || "—" }}</div>
          </div>
          <div>
            <strong>Student ID</strong>
            <div>{{ idv.studentIdOnCard || "—" }}</div>
          </div>
          <div>
            <strong>University</strong>
            <div>{{ idv.universityOnCard || "—" }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import api from "@/api";

const idvLoading = ref(false);
const submitting = ref(false);
const idv = reactive({
  id: null,
  status: null,
  score: null,
  note: "",
  nameOnCard: "",
  studentIdOnCard: "",
  universityOnCard: "",
  frontUrl: "",
  backUrl: "",
  selfieUrl: "",
});

// email + otp
const schoolEmail = ref("");
const schoolEmailVerified = ref(false);
const requestingOtp = ref(false);
const confirmingOtp = ref(false);
const otpCode = ref("");
const otpStatus = ref("");
const otpError = ref("");

onMounted(async () => {
  await fetchProfileBits();
  await fetchIdv();
});

async function fetchProfileBits() {
  try {
    const { data } = await api.get("/room-finder/me");
    schoolEmail.value = data.schoolEmail ?? "";
    schoolEmailVerified.value = Boolean(data.schoolEmailVerified);
  } catch (e) {
    console.error(e);
  }
}

// Generic email validation
const isValidEmail = computed(() => {
  const e = (schoolEmail.value || "").trim();
  if (!e || !e.includes("@")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
});

async function requestOtp(e) {
  e?.preventDefault?.();
  otpStatus.value = "";
  otpError.value = "";
  try {
    requestingOtp.value = true;
    await api.post("/verify-email/request", null, {
      params: { email: schoolEmail.value },
    });
    otpStatus.value = "Code sent to your email.";
    // when you request a new code, backend also resets verified=false for your account
    schoolEmailVerified.value = false;
  } catch (err) {
    otpError.value = "Could not send code. Check the email address.";
    console.error(err);
  } finally {
    requestingOtp.value = false;
  }
}

async function confirmOtp(e) {
  e?.preventDefault?.();
  otpStatus.value = "";
  otpError.value = "";
  try {
    confirmingOtp.value = true;
    const { data } = await api.post("/verify-email/confirm", null, {
      params: { email: schoolEmail.value, code: otpCode.value },
    });
    // flip from server truth
    schoolEmail.value = data?.schoolEmail ?? schoolEmail.value;
    schoolEmailVerified.value = Boolean(data?.schoolEmailVerified);

    otpCode.value = "";
    otpStatus.value = "Email verified.";
  } catch (err) {
    otpError.value = "Invalid/expired code.";
    console.error(err);
  } finally {
    confirmingOtp.value = false;
  }
}

/* --- student id --- */
async function fetchIdv() {
  idvLoading.value = true;
  try {
    const { data } = await api.get("/verifications/student-id/me");
    if (data) Object.assign(idv, data);
    else
      Object.assign(idv, {
        id: null,
        status: null,
        score: null,
        note: "",
        frontUrl: "",
        backUrl: "",
        selfieUrl: "",
      });
  } catch (e) {
    console.error(e);
  } finally {
    idvLoading.value = false;
  }
}
async function createVerification() {
  try {
    idvLoading.value = true;
    const { data } = await api.post("/verifications/student-id/create");
    idv.id = data?.id;
  } catch (e) {
    alert("Could not start verification.");
    console.error(e);
  } finally {
    idvLoading.value = false;
  }
}
async function onPick(evt, side) {
  const file = evt.target?.files?.[0];
  if (!file || !idv.id) return;
  const fd = new FormData();
  fd.append("side", side);
  fd.append("file", file);
  try {
    await api.put(`/verifications/student-id/${idv.id}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchIdv();
  } catch (e) {
    alert("Upload failed.");
    console.error(e);
  } finally {
    evt.target.value = "";
  }
}
async function submitVerification() {
  if (!idv.id) return;
  try {
    submitting.value = true;
    await api.put(`/verifications/student-id/${idv.id}/submit`);
    await fetchIdv();
    alert("Submitted. We’ll process this shortly.");
  } catch (e) {
    alert("Could not submit.");
    console.error(e);
  } finally {
    submitting.value = false;
  }
}

const statusClass = computed(() =>
  idv.status === "VERIFIED"
    ? "pill-ok"
    : idv.status === "REJECTED"
    ? "pill-bad"
    : idv.status === "PENDING"
    ? "pill-warn"
    : ""
);
const statusLabel = computed(() =>
  idv.status === "VERIFIED"
    ? "Verified"
    : idv.status === "REJECTED"
    ? "Needs review"
    : idv.status === "PENDING"
    ? "Pending"
    : "—"
);
function bg(url) {
  return url ? { backgroundImage: `url(${url})` } : {};
}
</script>

<style scoped>
/* shared-ish */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.span-2 {
  grid-column: 1 / -1;
}
label {
  display: flex;
  flex-direction: column;
  font-weight: 700;
  color: #0c4a23;
}
input,
select {
  margin-top: 0.35rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid #1b9536;
  border-radius: 6px;
  font-family: inherit;
}
.small {
  font-size: 0.9rem;
}
.muted {
  color: #666;
}
.btn-ghost {
  background: transparent;
  color: #1b9536;
  border: 1px solid #1b9536;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.primary {
  margin-top: 0.25rem;
  padding: 0.8rem 1.2rem;
  background: #1b9536;
  color: #fff;
  border: 0;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.error {
  color: #c92a2a;
}
.ok-text {
  color: #1b9536;
}

.card.idv-card {
  background: #fff;
  border: 1px solid #1b9536;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.badge {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.8rem;
}
.badge.ok {
  background: #e6fff1;
  color: #1b9536;
  border: 1px solid #b8f1ce;
}
.badge.warn {
  background: #fff7cc;
  color: #8a6a00;
  border: 1px solid #fde68a;
}

.pill {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.8rem;
}
.pill-ok {
  background: #d4ff87;
  color: #1b9536;
}
.pill-warn {
  background: #fff7cc;
  color: #8a6a00;
}
.pill-bad {
  background: #ffe3e3;
  color: #a61b1b;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin: 0.5rem 0 0.75rem;
}
.uploader {
  display: grid;
  gap: 0.4rem;
}
.thumb {
  height: 150px;
  background: #e6fff1;
  background-size: cover;
  background-position: center;
  border: 1px dashed #1b9536;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #1b9536;
  font-weight: 800;
}
.actions-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin: 0.4rem 0 0.5rem;
}
.otp {
  width: 140px;
  text-align: center;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  background: #f7fff0;
  border: 1px dashed #b8f1ce;
  border-radius: 8px;
  padding: 0.75rem;
}
.score {
  background: #e6fff1;
  border: 1px solid #b8f1ce;
  color: #1b9536;
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  font-weight: 800;
}

@media (max-width: 900px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
  .result-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: auto;
  }
  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
