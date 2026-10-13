// Fallback for tooling; Metro selects .native or .web for the actual platform.
export async function getDeviceInfo() {return {deviceIdentifier:'unknown',platform:'PWA',operatingSystem:'Unknown',appVersion:'1.0.0',manufacturer:'Unknown',model:'Unknown',pushToken:''};}
