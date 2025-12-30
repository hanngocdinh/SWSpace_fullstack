const { override } = require('customize-cra');

module.exports = override(
  (config, env) => {
    // Fix for allowedHosts error
    if (config.devServer) {
      config.devServer.allowedHosts = 'all';
    }
    
    // Disable source maps for better performance
    if (env === 'development') {
      config.devtool = false;
    }
    
    return config;
  }
);