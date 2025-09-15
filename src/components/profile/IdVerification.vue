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

    <!-- STUDENT ID VERIFICATION -->
    <div class="card idv-card">
      <div class="row-head">
        <h2>Student ID Card</h2>
        <span v-if="idv.status" :class="['pill', statusClass]">
          {{ statusLabel }}
        </span>
      </div>

      <!-- Start -->
      <div v-if="!idv.id" class="start">
        <p class="muted">
          Upload the <strong>front</strong> of your student ID (required).
        </p>
        <button
          class="primary"
          @click="createVerification"
          :disabled="idvLoading"
        >
          {{ idvLoading ? "Starting…" : "Start Verification" }}
        </button>
      </div>

      <!-- Single uploader + Submit -->
      <div v-else>
        <div class="upload-grid">
          <div class="uploader">
            <div class="thumb" :key="idv.frontUrl" :style="bg(idv.frontUrl)">
              <template v-if="!idv.frontUrl">
                Front <small>(required)</small>
              </template>
            </div>

            <!-- Hidden real input -->
            <input
              id="frontFile"
              class="file-input"
              type="file"
              accept="image/*"
              @change="onPick($event, 'front')"
              :disabled="submitting || !idv.id"
            />

            <!-- Styled triggers -->
            <div class="upload-buttons">
              <label
                for="frontFile"
                class="btn-action btn-upload"
                :class="{ 'is-disabled': submitting || !idv.id }"
                :aria-disabled="submitting || !idv.id"
                title="Choose an image file"
              >
                Choose Image
              </label>

              <button
                type="button"
                class="btn-action btn-cam"
                @click="openCamera"
                :disabled="submitting || !idv.id || !hasMediaDevices"
                :title="
                  !hasMediaDevices
                    ? 'Camera not supported on this device'
                    : 'Open camera'
                "
              >
                📷 Take Photo
              </button>
            </div>

            <!-- Selected filename -->
            <span class="file-name" v-if="selectedName">{{
              selectedName
            }}</span>
          </div>
        </div>

        <div class="actions-row">
          <button
            class="primary"
            @click="submitVerification"
            :disabled="submitting || !idv.id || !idv.frontUrl"
          >
            {{ submitting ? "Submitting…" : "Submit for Review" }}
          </button>
          <span class="muted" v-if="idv.status === 'REJECTED' && idv.note">
            Reason: {{ idv.note }}
          </span>
          <span class="muted" v-else-if="idv.status === 'VERIFIED' && idv.note">
            {{ idv.note }}
          </span>
        </div>

        <!-- Results (only Score + Student ID) -->
        <div class="result-grid" v-if="idv.status">
          <div>
            <strong>Score</strong>
            <div class="score">{{ formattedScore }}</div>
          </div>
          <div>
            <strong>Student ID</strong>
            <div>{{ idv.studentIdOnCard || "—" }}</div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="idvError" class="error">{{ idvError }}</p>

    <!-- CAMERA MODAL -->
    <div
      v-if="cam.open"
      class="camera-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Camera capture"
    >
      <div class="cam-box">
        <div class="cam-head">
          <h3>Take a Photo</h3>
          <button class="cam-close" @click="closeCamera" aria-label="Close">
            ✕
          </button>
        </div>

        <p class="muted cam-tip">
          When prompted by your browser, choose <strong>Allow</strong> to give
          camera access.
        </p>
        <p class="error" v-if="cam.error">{{ cam.error }}</p>

        <div class="cam-stage">
          <!-- Live preview -->
          <video
            v-show="cam.stage === 'preview'"
            ref="videoEl"
            autoplay
            playsinline
            class="cam-video"
          ></video>

          <!-- Captured preview -->
          <img
            v-show="cam.stage === 'shot'"
            :src="cam.photoUrl"
            alt="Captured preview"
            class="cam-shot"
          />

          <!-- hidden canvas for capture -->
          <canvas ref="canvasEl" class="hidden-canvas"></canvas>
        </div>

        <div class="cam-actions">
          <button class="btn-action btn-ghost" @click="closeCamera">
            Cancel
          </button>

          <button
            v-if="cam.stage === 'preview'"
            class="btn-action btn-upload"
            @click="captureFrame"
            :disabled="!cam.stream"
          >
            Capture
          </button>

          <template v-else>
            <button class="btn-action btn-cam" @click="retake">Retake</button>
            <button
              class="btn-action btn-upload"
              @click="useCaptured"
              :disabled="usingCaptured"
            >
              {{ usingCaptured ? "Uploading…" : "Use Photo" }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from "vue";
import api from "@/api";

/* ---------- helpers ---------- */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
function toAbs(u) {
  if (!u) return "";
  // treat http(s), blob, and data URIs as absolute
  if (/^(https?:|blob:|data:)/i.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}
function bg(u) {
  if (!u) return {};
  const abs = toAbs(u);
  const isBlob = /^blob:/i.test(abs) || /^data:/i.test(abs);
  const final = isBlob
    ? abs
    : `${abs}${abs.includes("?") ? "&" : "?"}t=${Date.now()}`;
  return { backgroundImage: `url("${final}")` };
}

/* ---------- state ---------- */
const idvLoading = ref(false);
const submitting = ref(false);
const idvError = ref("");
const lastBlobUrl = ref("");
const selectedName = ref("");

const idv = reactive({
  id: null,
  status: null,
  score: null,
  note: "",
  nameOnCard: "",
  studentIdOnCard: "",
  universityOnCard: "",
  gradYearOnCard: null,
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

/* ---------- camera ---------- */
const hasMediaDevices =
  typeof navigator !== "undefined" && !!navigator.mediaDevices;
const cam = reactive({
  open: false,
  stage: "preview", // 'preview' | 'shot'
  error: "",
  stream: null,
  photoUrl: "",
  blob: null,
});
const videoEl = ref(null);
const canvasEl = ref(null);
const usingCaptured = ref(false);

/* ---------- lifecycle ---------- */
onMounted(async () => {
  await fetchProfileBits();
  await fetchIdv();
});

onBeforeUnmount(() => {
  if (lastBlobUrl.value) {
    URL.revokeObjectURL(lastBlobUrl.value);
    lastBlobUrl.value = "";
  }
  stopCamera();
});

/* ---------- profile/email ---------- */
async function fetchProfileBits() {
  try {
    const { data } = await api.get("/room-finder/me");
    schoolEmail.value = data.schoolEmail ?? "";
    schoolEmailVerified.value = Boolean(data.schoolEmailVerified);
  } catch (e) {
    console.error(e);
  }
}

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

/* ---------- ID verification ---------- */
async function fetchIdv() {
  idvLoading.value = true;
  idvError.value = "";
  try {
    const { data } = await api.get("/verifications/student-id/me");
    if (data) {
      Object.assign(idv, {
        id: data.id,
        status: data.status,
        score: data.score,
        note: data.note,
        nameOnCard: data.nameOnCard,
        studentIdOnCard: data.studentIdOnCard,
        universityOnCard: data.universityOnCard,
        gradYearOnCard: data.gradYearOnCard,
        frontUrl: toAbs(data.frontUrl),
        backUrl: toAbs(data.backUrl),
        selfieUrl: toAbs(data.selfieUrl),
      });
    } else {
      Object.assign(idv, {
        id: null,
        status: null,
        score: null,
        note: "",
        nameOnCard: "",
        studentIdOnCard: "",
        universityOnCard: "",
        gradYearOnCard: null,
        frontUrl: "",
        backUrl: "",
        selfieUrl: "",
      });
    }
  } catch (e) {
    console.error(e);
    idvError.value = "Could not load verification.";
  } finally {
    idvLoading.value = false;
  }
}

async function createVerification() {
  try {
    idvLoading.value = true;
    const { data } = await api.post("/verifications/student-id/create");
    idv.id = data?.id;
    idv.status = data?.status ?? "DRAFT";
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

  // show chosen filename
  selectedName.value = file.name;

  // revoke previous blob preview if any
  if (lastBlobUrl.value) {
    URL.revokeObjectURL(lastBlobUrl.value);
    lastBlobUrl.value = "";
  }

  // Instant local preview (front only)
  const blobUrl = URL.createObjectURL(file);
  lastBlobUrl.value = blobUrl;
  if (side === "front") idv.frontUrl = blobUrl;

  const fd = new FormData();
  fd.append("side", side);
  fd.append("file", file);

  try {
    await api.put(`/verifications/student-id/${idv.id}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchIdv(); // refresh server URL
  } catch (e) {
    alert("Upload failed.");
    console.error(e);
  } finally {
    // allow re-selecting the same file
    if (evt?.target) evt.target.value = "";
  }
}

async function submitVerification() {
  if (!idv.id || !idv.frontUrl) return;
  try {
    submitting.value = true;
    await api.put(`/verifications/student-id/${idv.id}/submit`);
    await fetchIdv(); // updates score/fields/status
    alert(
      idv.status === "VERIFIED"
        ? "Verified! Your email and card ID match."
        : "Submitted. Result: " + (idv.note || idv.status)
    );
  } catch (e) {
    const s = e?.response?.status;
    if (s === 502 || s === 504) {
      alert(
        "Verification service is unavailable. Please try again in a minute."
      );
    } else {
      alert("Could not submit.");
    }
    console.error(e);
  } finally {
    submitting.value = false;
  }
}

/* ---------- camera controls ---------- */
async function openCamera() {
  cam.error = "";
  cam.photoUrl = "";
  cam.blob = null;
  cam.stage = "preview";
  cam.open = true;

  if (!hasMediaDevices) {
    cam.error = "Camera API not supported on this device/browser.";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
      },
      audio: false,
    });
    cam.stream = stream;
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      await videoEl.value.play();
    }
  } catch (err) {
    // Common cases: NotAllowedError (blocked), NotFoundError (no camera), NotReadableError (in use)
    if (err?.name === "NotAllowedError") {
      cam.error =
        "Camera permission was denied. Please click the address bar camera icon to Allow.";
    } else if (err?.name === "NotFoundError") {
      cam.error = "No camera found on this device.";
    } else if (
      location.protocol !== "https:" &&
      location.hostname !== "localhost"
    ) {
      cam.error = "Camera requires HTTPS or localhost in most browsers.";
    } else {
      cam.error = "Could not start camera.";
    }
    console.error(err);
  }
}

function stopCamera() {
  if (cam.stream) {
    try {
      cam.stream.getTracks().forEach((t) => t.stop());
    } catch {}
  }
  cam.stream = null;
  if (videoEl.value) videoEl.value.srcObject = null;
}

function closeCamera() {
  stopCamera();
  if (cam.photoUrl) {
    URL.revokeObjectURL(cam.photoUrl);
    cam.photoUrl = "";
  }
  cam.open = false;
  cam.stage = "preview";
  cam.blob = null;
}

function retake() {
  if (cam.photoUrl) {
    URL.revokeObjectURL(cam.photoUrl);
    cam.photoUrl = "";
  }
  cam.blob = null;
  cam.stage = "preview";
}

function captureFrame() {
  if (!videoEl.value || !canvasEl.value) return;
  const w = videoEl.value.videoWidth || 1280;
  const h = videoEl.value.videoHeight || 720;
  canvasEl.value.width = w;
  canvasEl.value.height = h;
  const ctx = canvasEl.value.getContext("2d");
  ctx.drawImage(videoEl.value, 0, 0, w, h);

  canvasEl.value.toBlob(
    (blob) => {
      if (!blob) return;
      // preview URL
      const url = URL.createObjectURL(blob);
      cam.photoUrl = url;
      cam.blob = blob;
      cam.stage = "shot";
    },
    "image/jpeg",
    0.92
  );
}

async function useCaptured() {
  if (!cam.blob || !idv.id) return;
  usingCaptured.value = true;

  // immediate UI feedback
  if (lastBlobUrl.value) {
    URL.revokeObjectURL(lastBlobUrl.value);
    lastBlobUrl.value = "";
  }
  const uiUrl = cam.photoUrl;
  lastBlobUrl.value = uiUrl;
  idv.frontUrl = uiUrl;
  selectedName.value = "captured.jpg";

  const fd = new FormData();
  fd.append("side", "front");
  // Wrap blob as File to include a name
  const file = new File([cam.blob], "captured.jpg", { type: "image/jpeg" });
  fd.append("file", file);

  try {
    await api.put(`/verifications/student-id/${idv.id}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchIdv();
    closeCamera();
  } catch (e) {
    alert("Upload failed.");
    console.error(e);
  } finally {
    usingCaptured.value = false;
  }
}

/* ---------- computed ---------- */
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

const formattedScore = computed(() =>
  idv.score == null ? "—" : Number(idv.score).toFixed(3)
);
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

/* Uploader */
.upload-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 0.5rem 0 0.75rem;
}
.uploader {
  display: grid;
  gap: 0.6rem 0.8rem;
  align-items: center;
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
.upload-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Hide real file input (but keep accessible for label) */
.file-input {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* Action buttons */
.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-weight: 800;
  border: 1px solid #1b9536;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease,
    box-shadow 0.18s ease, transform 0.02s ease;
}
.btn-action.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
.btn-upload {
  background: #1b9536;
  color: #fff;
}
.btn-upload:hover {
  background: #16812d;
  border-color: #16812d;
  box-shadow: 0 8px 20px rgba(27, 149, 54, 0.22);
}
.btn-cam {
  background: #fff;
  color: #1b9536;
}
.btn-cam:hover {
  background: rgba(27, 149, 54, 0.08);
  box-shadow: 0 6px 16px rgba(27, 149, 54, 0.15);
}
.btn-action:focus-visible {
  outline: 3px solid rgba(27, 149, 54, 0.35);
  outline-offset: 2px;
}

.file-name {
  display: inline-block;
  color: #0c4a23;
  font-weight: 700;
}

/* Actions row below uploader */
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

/* results: only 2 columns */
.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

/* Camera modal */
.camera-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  z-index: 60;
}
.cam-box {
  width: min(92vw, 720px);
  background: #fff;
  border: 1px solid #e6ffe8;
  border-radius: 12px;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.2);
  padding: 0.8rem;
}
.cam-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cam-close {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
}
.cam-tip {
  margin: 0.25rem 0 0.5rem;
}
.cam-stage {
  position: relative;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
}
.cam-video,
.cam-shot {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hidden-canvas {
  display: none;
}
.cam-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 0.6rem;
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
