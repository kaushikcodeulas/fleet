const fs = require('fs');

const appGradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const rootGradle = fs.readFileSync('android/build.gradle', 'utf8');

console.log('--- Verification ---');
console.log('Kotlin 2.1.21:      ', rootGradle.includes('kotlin-gradle-plugin:2.1.21') ? '✅' : '❌');
console.log('Desugaring enabled: ', appGradle.includes('coreLibraryDesugaringEnabled true') ? '✅' : '❌');
console.log('Desugar lib:        ', appGradle.includes('desugar_jdk_libs') ? '✅' : '❌');
console.log('Maps excluded:      ', appGradle.includes('com.google.android.gms') ? '✅' : '❌');