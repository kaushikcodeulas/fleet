const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('==========================================');
console.log('       DESUGARING SETUP VERIFICATION      ');
console.log('==========================================\n');

let allPassed = true;

// 1. Check app.json
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const plugins = appJson.expo.plugins || [];
  const hasPlugin = plugins.some(p => p === './plugins/withDesugaring' || (Array.isArray(p) && p[0] === './plugins/withDesugaring'));
  console.log(`[1] app.json contains './plugins/withDesugaring': ${hasPlugin ? '✅ PASS' : '❌ FAIL'}`);
  if (!hasPlugin) allPassed = false;
} catch (e) {
  console.log(`[1] app.json check error: ❌ FAIL (${e.message})`);
  allPassed = false;
}

// 2. Check plugin file exists and loads
try {
  const plugin = require('./plugins/withDesugaring');
  console.log(`[2] plugins/withDesugaring.js exists & loads:    ✅ PASS`);
} catch (e) {
  console.log(`[2] plugins/withDesugaring.js error:            ❌ FAIL (${e.message})`);
  allPassed = false;
}

// 3. Simulate plugin transformation on clean Expo template
try {
  const { setCompileOptionsDesugaring, addDesugarDependency } = require('./plugins/withDesugaring');
  const cleanGradleTemplate = `
android {
    namespace 'com.naracoo.fleet'
    compileSdk rootProject.ext.compileSdkVersion
}
dependencies {
    implementation("com.facebook.react:react-android")
}
`;
  let transformed = setCompileOptionsDesugaring(cleanGradleTemplate);
  transformed = addDesugarDependency(transformed);
  
  const hasCompileOpt = transformed.includes('coreLibraryDesugaringEnabled true');
  const hasDep = transformed.includes("coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.4'");

  console.log(`[3] Plugin injects compileOptions.desugaring:    ${hasCompileOpt ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`[4] Plugin injects desugar_jdk_libs dependency:  ${hasDep ? '✅ PASS' : '❌ FAIL'}`);
  if (!hasCompileOpt || !hasDep) allPassed = false;
} catch (e) {
  console.log(`[3/4] Plugin simulation error:                   ❌ FAIL (${e.message})`);
  allPassed = false;
}

// 5. Check current android/app/build.gradle
try {
  const appGradle = fs.readFileSync('android/app/build.gradle', 'utf8');
  const hasAppCompileOpt = appGradle.includes('coreLibraryDesugaringEnabled true');
  const hasAppDep = appGradle.includes('desugar_jdk_libs');
  console.log(`[5] android/app/build.gradle desugaring enabled: ${hasAppCompileOpt ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`[6] android/app/build.gradle desugar lib present: ${hasAppDep ? '✅ PASS' : '❌ FAIL'}`);
  if (!hasAppCompileOpt || !hasAppDep) allPassed = false;
} catch (e) {
  console.log(`[5/6] android/app/build.gradle check error:      ❌ FAIL (${e.message})`);
  allPassed = false;
}

// 7. Check git status
try {
  const gitStatus = execSync('git status --porcelain plugins/withDesugaring.js').toString();
  const isDeleted = gitStatus.startsWith('D');
  console.log(`[7] Git tracking for plugins/withDesugaring.js:   ${!isDeleted ? '✅ TRACKED' : '❌ STAGED AS DELETED'}`);
  if (isDeleted) allPassed = false;
} catch (e) {
  console.log(`[7] Git check warning:                           ⚠️ SKIPPED (${e.message})`);
}

console.log('\n==========================================');
if (allPassed) {
  console.log('  STATUS: ALL CHECKS PASSED SUCCESSFULLY!  ');
} else {
  console.log('  STATUS: SOME CHECKS FAILED!             ');
}
console.log('==========================================\n');