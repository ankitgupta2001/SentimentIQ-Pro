#!/usr/bin/env node

/**
 * Detailed Test Runner
 * Executes all test suites with comprehensive logging and analysis
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 SentimentIQ Pro - Comprehensive Test Suite Execution\n');
console.log('=' .repeat(80));

// Test categories and their descriptions
const testCategories = {
  'auth.test.js': {
    name: 'Authentication & User Management',
    description: 'Tests login, registration, session management, and profile operations',
    expectedTests: 15
  },
  'sentiment.test.js': {
    name: 'Text Analysis Features',
    description: 'Tests all AI-powered analysis features individually and error handling',
    expectedTests: 35
  },
  'tiers.test.js': {
    name: 'User Tier System',
    description: 'Tests tier-based access control and feature restrictions',
    expectedTests: 20
  },
  'admin.test.js': {
    name: 'Admin Dashboard & System Monitoring',
    description: 'Tests admin functionality, logging, analytics, and user management',
    expectedTests: 25
  },
  'integration.test.js': {
    name: 'Integration & End-to-End Workflows',
    description: 'Tests complete user journeys and feature combinations',
    expectedTests: 30
  }
};

// Function to run individual test file
function runTestFile(testFile) {
  const category = testCategories[testFile];
  
  console.log(`\n📋 Running: ${category.name}`);
  console.log(`📝 Description: ${category.description}`);
  console.log(`🎯 Expected Tests: ${category.expectedTests}`);
  console.log('-'.repeat(60));
  
  try {
    const result = execSync(`npm test tests/${testFile} -- --verbose`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ PASSED');
    console.log(result);
    
    return { file: testFile, status: 'PASSED', output: result };
  } catch (error) {
    console.log('❌ FAILED');
    console.log(error.stdout || error.message);
    
    return { file: testFile, status: 'FAILED', output: error.stdout || error.message };
  }
}

// Function to analyze test results
function analyzeResults(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const total = results.length;
  
  console.log(`\n📈 Overall Results:`);
  console.log(`   ✅ Passed: ${passed}/${total} test suites`);
  console.log(`   ❌ Failed: ${failed}/${total} test suites`);
  console.log(`   📊 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
  
  console.log(`\n📋 Detailed Results:`);
  results.forEach(result => {
    const category = testCategories[result.file];
    const status = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`   ${status} ${category.name}`);
  });
  
  if (failed > 0) {
    console.log(`\n🔍 Failed Test Details:`);
    results.filter(r => r.status === 'FAILED').forEach(result => {
      console.log(`\n❌ ${result.file}:`);
      console.log(result.output.substring(0, 500) + '...');
    });
  }
  
  console.log('\n' + '='.repeat(80));
}

// Function to check test coverage
function checkCoverage() {
  console.log('\n🔍 COVERAGE ANALYSIS');
  console.log('='.repeat(80));
  
  try {
    const coverageResult = execSync('npm test -- --coverage --silent', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(coverageResult);
  } catch (error) {
    console.log('Coverage analysis failed:', error.message);
  }
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  console.log(`🚀 Starting test execution at ${new Date().toLocaleString()}\n`);
  
  // Run each test category
  const results = [];
  for (const testFile of Object.keys(testCategories)) {
    const result = runTestFile(testFile);
    results.push(result);
  }
  
  // Analyze results
  analyzeResults(results);
  
  // Check coverage
  checkCoverage();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n⏱️  Total execution time: ${duration} seconds`);
  console.log(`🏁 Test execution completed at ${new Date().toLocaleString()}`);
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTestFile, analyzeResults, checkCoverage };