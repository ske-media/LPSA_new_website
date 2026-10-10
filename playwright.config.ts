import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'**/*.spec.ts',workers:1,use:{baseURL:process.env.BASE_URL||'http://127.0.0.1:4321',headless:true},reporter:'list'});
