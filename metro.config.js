// Permite empacotar o banco SQLite pré-gerado (assets/db/bible.db) como asset.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('db');

module.exports = config;
