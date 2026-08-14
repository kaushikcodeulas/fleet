const fs = require('fs');
const path = require('path');

// ── Patch android/build.gradle ─────────────────────────────────
const rootGradlePath = path.join(__dirname, 'android/build.gradle');
let rootGradle = fs.readFileSync(rootGradlePath, 'utf8');

// Fix kotlin-gradle-plugin - add version explicitly
if (rootGradle.includes("classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')")) {
  rootGradle = rootGradle.replace(
    "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
    "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.21')"
  );
  console.log('Kotlin version 2.1.21 added to classpath ✅');
} else if (rootGradle.includes('classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")')) {
  rootGradle = rootGradle.replace(
    'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")',
    'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.21")'
  );
  console.log('Kotlin version 2.1.21 added to classpath ✅');
} else {
  console.log('kotlin-gradle-plugin line not found in expected format ❌');
}

fs.writeFileSync(rootGradlePath, rootGradle);

// ── Patch android/app/build.gradle ────────────────────────────
const gradlePath = path.join(__dirname, 'android/app/build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');

if (!gradle.includes('coreLibraryDesugaringEnabled')) {
  if (gradle.includes('compileOptions {')) {
    gradle = gradle.replace(
      'compileOptions {',
      'compileOptions {\n        coreLibraryDesugaringEnabled true'
    );
  } else {
    gradle = gradle.replace(
      'compileSdk rootProject.ext.compileSdkVersion',
      `compileSdk rootProject.ext.compileSdkVersion
    compileOptions {
        coreLibraryDesugaringEnabled true
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }`
    );
  }
  console.log('coreLibraryDesugaringEnabled injected ✅');
} else {
  console.log('coreLibraryDesugaringEnabled already present ✅');
}

if (!gradle.includes('desugar_jdk_libs')) {
  gradle = gradle.replace(
    /dependencies\s*\{/,
    "dependencies {\n    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.4'"
  );
  console.log('desugar_jdk_libs injected ✅');
} else {
  console.log('desugar_jdk_libs already present ✅');
}

fs.writeFileSync(gradlePath, gradle);

// ── Verification ───────────────────────────────────────────────
console.log('\n--- Verification ---');
const rootResult = fs.readFileSync(rootGradlePath, 'utf8');
const appResult  = fs.readFileSync(gradlePath, 'utf8');

console.log('Kotlin 2.1.21:', rootResult.includes('kotlin-gradle-plugin:2.1.21') ? '✅' : '❌');
console.log('coreLibraryDesugaringEnabled:', appResult.includes('coreLibraryDesugaringEnabled true') ? '✅' : '❌');
console.log('desugar_jdk_libs:', appResult.includes('desugar_jdk_libs') ? '✅' : '❌');