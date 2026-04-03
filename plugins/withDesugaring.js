const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

function withDesugaringAndExclusion(config) {
  return withAppBuildGradle(config, (config) => {
    let gradle = config.modResults.contents;

    // Fix 1: coreLibraryDesugaringEnabled
    // Strategy: inject directly inside compileOptions { } block
    if (!gradle.includes('coreLibraryDesugaringEnabled true')) {
      // Try sourceCompatibility variations first
      const replacements = [
        ['sourceCompatibility JavaVersion.VERSION_1_8',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility JavaVersion.VERSION_1_8'],
        ['sourceCompatibility = JavaVersion.VERSION_1_8',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility = JavaVersion.VERSION_1_8'],
        ['sourceCompatibility JavaVersion.VERSION_11',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility JavaVersion.VERSION_11'],
        ['sourceCompatibility = JavaVersion.VERSION_11',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility = JavaVersion.VERSION_11'],
        ['sourceCompatibility JavaVersion.VERSION_17',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility JavaVersion.VERSION_17'],
        ['sourceCompatibility = JavaVersion.VERSION_17',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility = JavaVersion.VERSION_17'],
        ['sourceCompatibility = JavaVersion.VERSION_21',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility = JavaVersion.VERSION_21'],
        ['sourceCompatibility JavaVersion.VERSION_21',
         'coreLibraryDesugaringEnabled true\n        sourceCompatibility JavaVersion.VERSION_21'],
      ];

      let replaced = false;
      for (const [from, to] of replacements) {
        if (gradle.includes(from)) {
          gradle = gradle.replace(from, to);
          replaced = true;
          console.log('coreLibraryDesugaringEnabled injected via sourceCompatibility ✅');
          break;
        }
      }

      // Fallback: inject inside compileOptions { } directly using regex
      if (!replaced) {
        console.log('sourceCompatibility not found, trying compileOptions regex...');
        const compileOptionsRegex = /(compileOptions\s*\{)/;
        if (compileOptionsRegex.test(gradle)) {
          gradle = gradle.replace(
            compileOptionsRegex,
            '$1\n        coreLibraryDesugaringEnabled true'
          );
          replaced = true;
          console.log('coreLibraryDesugaringEnabled injected via compileOptions regex ✅');
        }
      }

      // Last resort: append compileOptions block to android { }
      if (!replaced) {
        console.log('compileOptions not found, injecting full block...');
        gradle = gradle.replace(
          /(android\s*\{)/,
          `$1\n    compileOptions {\n        coreLibraryDesugaringEnabled true\n        sourceCompatibility JavaVersion.VERSION_1_8\n        targetCompatibility JavaVersion.VERSION_1_8\n    }\n`
        );
        console.log('Full compileOptions block injected ✅');
      }
    } else {
      console.log('coreLibraryDesugaringEnabled already present ✅');
    }

    // Fix 2: desugar dependency
    if (!gradle.includes('desugar_jdk_libs')) {
      gradle = gradle.replace(
        /dependencies\s*\{/,
        "dependencies {\n    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.4'"
      );
      console.log('desugar_jdk_libs injected ✅');
    } else {
      console.log('desugar_jdk_libs already present ✅');
    }

    // Fix 3: exclude play-services-maps
    if (!gradle.includes("exclude group: 'com.google.android.gms', module: 'play-services-maps'")) {
      gradle = gradle.replace(
        /^(android\s*\{)/m,
        `configurations.all {
    resolutionStrategy {
        force 'com.google.android.libraries.navigation:navigation:7.4.0'
    }
    exclude group: 'com.google.android.gms', module: 'play-services-maps'
}

$1`
      );
      console.log('play-services-maps excluded ✅');
    } else {
      console.log('play-services-maps already excluded ✅');
    }

    config.modResults.contents = gradle;
    return config;
  });
}

function withKotlinVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    let gradle = config.modResults.contents;
    gradle = gradle
      .replace(
        "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
        "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.21')"
      )
      .replace(
        'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")',
        'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.21")'
      );
    config.modResults.contents = gradle;
    return config;
  });
}

module.exports = function withNavigationFixes(config) {
  config = withDesugaringAndExclusion(config);
  config = withKotlinVersion(config);
  return config;
};