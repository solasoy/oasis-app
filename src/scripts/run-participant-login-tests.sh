#!/bin/bash

# Script to run tests for the participant login functionality

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running tests for participant login functionality...${NC}"

# Run auth utilities tests
echo -e "\n${YELLOW}Running auth utilities tests...${NC}"
npx jest src/tests/lib/auth-utils.test.ts --verbose
if [ $? -ne 0 ]; then
  echo -e "${RED}Auth utilities tests failed!${NC}"
  exit 1
fi
echo -e "${GREEN}Auth utilities tests passed!${NC}"

# Run email templates tests
echo -e "\n${YELLOW}Running email templates tests...${NC}"
npx jest src/tests/lib/email-templates.test.ts --verbose
if [ $? -ne 0 ]; then
  echo -e "${RED}Email templates tests failed!${NC}"
  exit 1
fi
echo -e "${GREEN}Email templates tests passed!${NC}"

# Run API tests
echo -e "\n${YELLOW}Running API tests...${NC}"
npx jest src/tests/api/participants/create-accounts.test.ts src/tests/api/admin/access-participant.test.ts src/tests/api/auth/reset-password.test.ts --verbose
if [ $? -ne 0 ]; then
  echo -e "${RED}API tests failed!${NC}"
  exit 1
fi
echo -e "${GREEN}API tests passed!${NC}"

# Run middleware tests
echo -e "\n${YELLOW}Running middleware tests...${NC}"
npx jest src/tests/middleware.test.ts --verbose
if [ $? -ne 0 ]; then
  echo -e "${RED}Middleware tests failed!${NC}"
  exit 1
fi
echo -e "${GREEN}Middleware tests passed!${NC}"

# Run component tests
echo -e "\n${YELLOW}Running component tests...${NC}"
npx jest src/tests/components/admin/participant-access-button.test.tsx --verbose
if [ $? -ne 0 ]; then
  echo -e "${RED}Component tests failed!${NC}"
  exit 1
fi
echo -e "${GREEN}Component tests passed!${NC}"

# Run page tests
echo -e "\n${YELLOW}Running page tests...${NC}"
npx jest src/tests/app/dashboard/reset-password/page.test.tsx src/tests/app/access-expired/page.test.tsx --verbose
if [ $? -ne 0 ]; then
  echo -e "${RED}Page tests failed!${NC}"
  exit 1
fi
echo -e "${GREEN}Page tests passed!${NC}"

# All tests passed
echo -e "\n${GREEN}All participant login tests passed!${NC}"