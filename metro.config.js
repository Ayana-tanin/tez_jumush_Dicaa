const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore the root node_modules since we only have dependencies in frontend
config.watchFolders = [__dirname + '/frontend'];
config.resolver.nodeModulesPaths = [__dirname + '/frontend/node_modules'];

// Add support for additional file extensions if needed
config.resolver.sourceExts.push('cjs');

module.exports = config;
