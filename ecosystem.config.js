module.exports = {
  apps: [{
    name: "mongo_users",
    script: "./dist/app.js",
    env: {
      NODE_ENV: "production",
      PORT: 3040,
      HOST: "0.0.0.0",
      MONGO_URI: "mongodb://userncs2025:ticsncs2025@190.96.96.20:27017/bd_clientes?authSource=admin"
    }
  }]
};
