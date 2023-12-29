<template>
  <div class="login-main d-flex align-items-center py-4 bg-body-tertiary">
    <main class="form-signin w-100 m-auto">
      <form @submit.prevent="login">
        <h1 class="h3 mb-3 fw-normal">Please sign in</h1>
        <div class="form-floating">
          <input v-model="email" type="email" class="form-control" id="floatingInput" placeholder="name@example.com" required>
          <label for="floatingInput">Email address</label>
        </div>
        <div class="form-floating">
          <input v-model="password" type="password" class="form-control" id="floatingPassword" placeholder="Password" required>
          <label for="floatingPassword">Password</label>
        </div>
        <button class="btn btn-primary w-100 py-2" type="submit">Sign in</button>
        <p class="mt-5 mb-3 text-body-secondary">&copy; 2017–2023</p>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import router from '@/router';

const email = ref('');
const password = ref('');

const login = () => {
  if (email.value === 'user@user' && password.value === 'password') {
    localStorage.setItem('token', 'xyz');
    router.push('/home');
  } else {
    alert('Invalid username or password');
  }
};
</script>

<style scoped>
.login-main {
  height: 100vh;
}

.form-signin {
  max-width: 330px;
  padding: 1rem;
}

.form-signin .form-floating:focus-within {
  z-index: 2;
}

.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
