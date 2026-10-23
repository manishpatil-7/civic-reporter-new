module.exports = ({ config }) => {
  const mapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    config.android?.config?.googleMaps?.apiKey ||
    '';

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: mapsApiKey,
        },
      },
    },
  };
};
