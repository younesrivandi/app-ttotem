const base = require('./app.json').expo;
// Public variables are bundled into the app: never put secrets in EXPO_PUBLIC_*.
module.exports = ({ config }) => {
  const release = process.env.APP_ENV === 'production';
  const androidPackage = process.env.TTOTEM_ANDROID_PACKAGE;
  const iosBundle = process.env.TTOTEM_IOS_BUNDLE_ID;
  const projectId = process.env.EAS_PROJECT_ID;
  if (release && (!androidPackage || !iosBundle || !projectId)) {
    throw new Error('Production requires TTOTEM_ANDROID_PACKAGE, TTOTEM_IOS_BUNDLE_ID, and EAS_PROJECT_ID.');
  }
  return {
    ...base,
    ...config,
    android: { ...base.android, ...config.android, ...(androidPackage ? { package: androidPackage } : {}) },
    ios: { ...base.ios, ...config.ios, ...(iosBundle ? { bundleIdentifier: iosBundle } : {}) },
    extra: { ...base.extra, ...config.extra, ...(projectId ? { eas: { projectId } } : {}) },
  };
};
