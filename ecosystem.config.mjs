export default {
  apps: [
    {
      name: "WJ-SERVER",
      script: "server.mjs", // 确保指向 ESM 入口文件
      interpreter: "node",
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
    },
  ],
};