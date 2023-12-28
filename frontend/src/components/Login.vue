<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <label for="username">Username:</label>
      <input v-model="username" type="text" id="username" required>
      <br>
      <label for="password">Password:</label>
      <input v-model="password" type="password" id="password" required>
      <br>
      <button type="submit">Login</button>
    </form>
  </div>
</template>
  
<script lang="ts">
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    login() {
      // Simulate login logic
      if (this.username === 'user' && this.password === 'password') {
        alert('Login successful!');
      } else {
        alert('Invalid username or password');
      }
    },
  },
};
</script>
  
<style scoped>
/* Add your component styles here */
</style>
  