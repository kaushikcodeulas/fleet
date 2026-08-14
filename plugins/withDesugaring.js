const { withAppBuildGradle } = require('@expo/config-plugins');

function setCompileOptionsDesugaring(gradle) {
  if (gradle.includes('coreLibraryDesugaringEnabled')) {
    return gradle;
  }

  if (/compileOptions\s*\{/.test(gradle)) {
    return gradle.replace(
      /compileOptions\s*\{/,
      'compileOptions {\n        coreLibraryDesugaringEnabled true'
    );
  }

  // Inject inside android { ... } block
  if (/android\s*\{/.test(gradle)) {
    return gradle.replace(
      /android\s*\{/,
      `android {
    compileOptions {
        coreLibraryDesugaringEnabled true
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }`
    );
  }

  return gradle;
}

function addDesugarDependency(gradle) {
  if (gradle.includes('desugar_jdk_libs')) {
    return gradle;
  }

  if (/dependencies\s*\{/.test(gradle)) {
    return gradle.replace(
      /dependencies\s*\{/,
      "dependencies {\n    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.4'"
    );
  }

  return gradle;
}

function excludePlayServicesMaps(gradle) {
  if (gradle.includes("play-services-maps")) {
    return gradle;
  }

  const exclusionBlock = `
configurations.all {
    exclude group: 'com.google.android.gms', module: 'play-services-maps'
}
`;

  return gradle + '\n' + exclusionBlock;
}

module.exports = function withDesugaring(config) {
  return withAppBuildGradle(config, (modConfig) => {
    let gradle = modConfig.modResults.contents;
    gradle = setCompileOptionsDesugaring(gradle);
    gradle = addDesugarDependency(gradle);
    gradle = excludePlayServicesMaps(gradle);
    modConfig.modResults.contents = gradle;
    return modConfig;
  });
};
module.exports.setCompileOptionsDesugaring = setCompileOptionsDesugaring;
module.exports.addDesugarDependency = addDesugarDependency;
module.exports.excludePlayServicesMaps = excludePlayServicesMaps;

