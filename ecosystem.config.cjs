module.exports = {
    apps: [
      {
        name: "wj-client",
        script: "app.js",
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