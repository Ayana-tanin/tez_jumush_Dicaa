// Загружаем полифиллы перед всем остальным
require('./polyfills');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure the project root
config.projectRoot = __dirname;

// Add support for additional file extensions if needed
config.resolver.sourceExts.push('cjs');

// Exclude the parent directory from watching
config.watchFolders = [__dirname];

module.exports = config;
