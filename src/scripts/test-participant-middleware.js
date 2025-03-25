/**
 * Script to run tests for the participant login middleware
 */

const { execSync } = require('child_process');

// ANSI color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}Running participant login middleware tests...${RESET}`);

try {
  execSync('npx jest src/tests/middleware_participant_login.test.ts --verbose', { stdio: 'inherit' });
  console.log(`\n${GREEN}Participant login middleware tests passed!${RESET}`);
  process.exit(0);
} catch (error) {
  console.error(`\n${RED}Participant login middleware tests failed!${RESET}`);
  process.exit(1);
}