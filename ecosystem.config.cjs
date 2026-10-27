module.exports = {
  apps: [
    {
      name: 'nexacard',
      cwd: '/var/www/html/nexacard/server',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 9600,
      },
      max_memory_restart: '400M',
      error_file: '/var/www/html/nexacard/logs/error.log',
      out_file: '/var/www/html/nexacard/logs/out.log',
      time: true,
    },
  ],
};
