<template>
  <div class="admin-register">
    <div class="register-container">
      <div class="register-card">
        <div class="logo-section">
          <div class="logo">🔐</div>
          <h1>Admin Registration</h1>
          <p>Create a new administrator account</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div v-if="error" class="error-banner">
            {{ error }}
          </div>

          <div v-if="success" class="success-banner">
            {{ success }}
          </div>

          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="John Doe"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="formData.email"
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
              v-model="formData.password"
              type="password"
              placeholder="Minimum 8 characters"
              required
              :disabled="loading"
              minlength="8"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              placeholder="+66 8x xxx xxxx"
              :disabled="loading"
            />
          </div>

          <button type="submit" class="register-btn" :disabled="loading">
            {{ loading ? "Creating Account..." : "Create Admin Account" }}
          </button>
        </form>

        <div class="footer-links">
          <p class="login-link">
            Already have an account?
            <router-link to="/admin/login">Login here</router-link>
          </p>
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

const formData = ref({
  name: "",
  email: "",
  password: "",
  phone: "",
});

const loading = ref(false);
const error = ref("");
const success = ref("");

async function handleRegister() {
  error.value = "";
  success.value = "";
  loading.value = true;

  try {
    // Register the admin
    const { data } = await api.post("/admin/register", {
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      phone: formData.value.phone,
    });

    success.value = "Account created successfully! Logging you in...";

    // Auto-login after successful registration
    setTimeout(async () => {
      try {
        const loginResponse = await api.post("/admin/login", {
          email: formData.value.email,
          password: formData.value.password,
        });

        if (loginResponse.data.token && loginResponse.data.admin) {
          localStorage.setItem("adminToken", loginResponse.data.token);
          localStorage.setItem(
            "adminUser",
            JSON.stringify(loginResponse.data.admin)
          );

          router.push("/admin/dashboard");
        }
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
        router.push("/admin/login");
      }
    }, 1500);
  } catch (err) {
    console.error("Admin registration failed:", err);

    if (err.response?.status === 409) {
      error.value =
        err.response.data?.error ||
        "This email is already registered. Try logging in.";
    } else if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else {
      error.value = "Registration failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-register {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c4a23 0%, #1b9536 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.register-container {
  width: 100%;
  max-width: 480px;
}

.register-card {
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

.register-form {
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

.success-banner {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background: #0f7a33;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 149, 54, 0.3);
}

.register-btn:disabled {
  background: #98a2b3;
  cursor: not-allowed;
}

.footer-links {
  margin-top: 1.5rem;
  text-align: center;
}

.login-link {
  color: #667085;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.login-link a {
  color: #1b9536;
  text-decoration: none;
  font-weight: 700;
  margin-left: 0.25rem;
}

.login-link a:hover {
  text-decoration: underline;
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
  margin-top: 0.5rem;
}

.back-link:hover {
  color: #0f7a33;
  text-decoration: underline;
}

/* Tablet */
@media (max-width: 768px) {
  .register-card {
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
  .admin-register {
    padding: 0.5rem;
  }

  .register-card {
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

  .register-btn {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
}
</style>
