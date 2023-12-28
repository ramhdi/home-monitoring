<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
  </header>
  <!-- <nav>
    <RouterLink to="/vue">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
  </nav> -->
  <RouterView />
</template>

<style scoped></style>
