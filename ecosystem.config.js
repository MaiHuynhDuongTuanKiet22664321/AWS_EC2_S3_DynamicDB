module.exports = {
  apps: [{
    name: "manager-product",
    script: "app.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
