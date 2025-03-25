/**
 * Script to run tests for the participant login functionality
 */

const { execSync } = require('child_process');
const path = require('path');

// ANSI color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * Run a Jest test and return whether it passed
 * @param {string} testPath - Path to the test file or directory
 * @param {string} description - Description of the test
 * @returns {boolean} - Whether the test passed
 */
function runTest(testPath, description) {
  console.log(`\n${YELLOW}Running ${description}...${RESET}`);
  
  try {
    execSync(`npx jest ${testPath} --verbose`, { stdio: 'inherit' });
    console.log(`${GREEN}${description} passed!${RESET}`);
    return true;
  } catch (error) {
    console.error(`${RED}${description} failed!${RESET}`);
    return false;
  }
}

// Main function to run all tests
function runAllTests() {
  console.log(`${YELLOW}Running tests for participant login functionality...${RESET}`);
  
  const tests = [
    {
      path: 'src/tests/lib/auth-utils.test.ts',
      description: 'auth utilities tests'
    },
    {
      path: 'src/tests/lib/email-templates.test.ts',
      description: 'email templates tests'
    },
    {
      path: 'src/tests/api/participants/create-accounts.test.ts src/tests/api/admin/access-participant.test.ts src/tests/api/auth/reset-password.test.ts',
      description: 'API tests'
    },
    {
      path: 'src/tests/middleware.test.ts',
      description: 'middleware tests'
    },
    {
      path: 'src/tests/components/admin/participant-access-button.test.tsx',
      description: 'component tests'
    },
    {
      path: 'src/tests/app/dashboard/reset-password/page.test.tsx src/tests/app/access-expired/page.test.tsx',
      description: 'page tests'
    }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    const passed = runTest(test.path, test.description);
    if (!passed) {
      allPassed = false;
      break;
    }
  }
  
  if (allPassed) {
    console.log(`\n${GREEN}All participant login tests passed!${RESET}`);
    process.exit(0);
  } else {
    console.error(`\n${RED}Some tests failed!${RESET}`);
    process.exit(1);
  }
}

// Run the tests
runAllTests();