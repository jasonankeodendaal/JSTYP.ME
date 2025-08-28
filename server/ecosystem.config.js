
module.exports = {
  apps: [
    {
      name: 'kiosk-api',
      script: 'server.js',
      watch: false,
      restart_delay: 5000, // Wait 5 seconds before restarting if it crashes
    },
    {
      name: 'kiosk-tunnel',
      script: 'cloudflared',
      args: 'tunnel --url http://localhost:3001',
      watch: false,
      restart_delay: 10000, // Wait 10 seconds before restarting
    }
  ]
};
