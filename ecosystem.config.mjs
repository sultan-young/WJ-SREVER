// ecosystem.config.mjs
export default {
  apps: [{
    name: "WJ-SERVER",
    script: "./server.mjs",  // 或 "./app.js"，根据实际入口文件调整
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "development",
      PORT: "5000",
    },
    env_production: {
      NODE_ENV: "production",
      PORT: "5000",
    },
  }],
};