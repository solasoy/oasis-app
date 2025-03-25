#!/bin/bash
# Master script for running verification tests

echo "Oasis App Fix Verification Tests"
echo "==============================="
echo

echo "Fix 1: Profile deletion issue"
echo "----------------------------"
echo "To verify the fix for the profile deletion issue, run:"
echo "  ./verify-fix1.sh"
echo

echo "Fix 2: Profile update issue"
echo "-------------------------"
echo "To verify the fix for the profile update issue, run:"
echo "  ./verify-fix2.sh"
echo

echo "Fix 3: Welcome email issue"
echo "------------------------"
echo "To verify the fix for the welcome email issue, run:"
echo "  ./verify-fix3.sh"
echo

echo "Important Notes:"
echo "--------------"
echo "1. Run each test script separately and complete the verification before moving to the next test."
echo "2. Each script will start the development server on port 3013."
echo "3. Press Ctrl+C to stop the server when done with each test."
echo "4. Check the server console logs for additional information, especially for the welcome email test."
echo

echo "Which test would you like to run? (Enter 1, 2, 3, or q to quit)"
read -p "Enter your choice: " choice

case $choice in
  1)
    bash verify-fix1.sh
    ;;
  2)
    bash verify-fix2.sh
    ;;
  3)
    bash verify-fix3.sh
    ;;
  q)
    echo "Exiting..."
    ;;
  *)
    echo "Invalid choice. Please run the script again and enter 1, 2, 3, or q."
    ;;
esac