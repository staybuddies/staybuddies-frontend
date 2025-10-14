<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <div class="logo">🔐</div>
          <h1>Admin Login</h1>
          <p>StayBuddies Administration Portal</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="error-banner">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              placeholder="admin@staybuddies.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? "Logging in..." : "Login to Admin Panel" }}
          </button>
        </form>

        <div class="footer-links">
          <router-link to="/" class="back-link">
            ← Back to Main Site
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";

const router = useRouter();

const credentials = ref({
  email: "",
  password: "",
});

const loading = ref(false);
const error = ref("");

async function handleLogin() {
  error.value = "";
  loading.value = true;

  try {
    const { data } = await api.post("/admin/login", {
      email: credentials.value.email,
      password: credentials.value.password,
    });

    // Store admin token and user info
    if (data.token && data.admin) {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } else {
      error.value = "Invalid response from server";
    }
  } catch (err) {
    console.error("Admin login failed:", err);

    if (err.response?.status === 401) {
      error.value = err.response.data?.error || "Invalid email or password";
    } else if (err.response?.status === 403) {
      error.value = "Access denied. Admin privileges required.";
    } else if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else {
      error.value = "Login failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c4a23 0%, #1b9536 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.logo-section h1 {
  color: #0c4a23;
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
  font-weight: 800;
}

.logo-section p {
  color: #667085;
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  margin-top: 2rem;
}

.error-banner {
  background: #fff2f2;
  border: 1px solid #fda29b;
  color: #b42318;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #0c4a23;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #d0e7d8;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #1b9536;
  box-shadow: 0 0 0 3px rgba(27, 149, 54, 0.1);
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  background: #1b9536;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background: #0f7a33;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 149, 54, 0.3);
}

.login-btn:disabled {
  background: #98a2b3;
  cursor: not-allowed;
}

.footer-links {
  margin-top: 1.5rem;
  text-align: center;
}

.back-link {
  color: #1b9536;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #0f7a33;
  text-decoration: underline;
}

/* Tablet */
@media (max-width: 768px) {
  .login-card {
    padding: 2rem;
  }

  .logo {
    font-size: 3rem;
  }

  .logo-section h1 {
    font-size: 1.6rem;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .admin-login {
    padding: 0.5rem;
  }

  .login-card {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .logo {
    font-size: 2.5rem;
  }

  .logo-section h1 {
    font-size: 1.4rem;
  }

  .logo-section p {
    font-size: 0.88rem;
  }

  .form-group input {
    padding: 0.65rem 0.85rem;
    font-size: 0.95rem;
  }

  .login-btn {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
}
</style>
