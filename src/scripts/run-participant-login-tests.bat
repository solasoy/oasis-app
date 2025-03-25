@echo off
REM Script to run tests for the participant login functionality

echo Running tests for participant login functionality...
echo.

REM Run auth utilities tests
echo Running auth utilities tests...
call npx jest src/tests/lib/auth-utils.test.ts --verbose
if %ERRORLEVEL% neq 0 (
  echo Auth utilities tests failed!
  exit /b 1
)
echo Auth utilities tests passed!
echo.

REM Run email templates tests
echo Running email templates tests...
call npx jest src/tests/lib/email-templates.test.ts --verbose
if %ERRORLEVEL% neq 0 (
  echo Email templates tests failed!
  exit /b 1
)
echo Email templates tests passed!
echo.

REM Run API tests
echo Running API tests...
call npx jest src/tests/api/participants/create-accounts.test.ts src/tests/api/admin/access-participant.test.ts src/tests/api/auth/reset-password.test.ts --verbose
if %ERRORLEVEL% neq 0 (
  echo API tests failed!
  exit /b 1
)
echo API tests passed!
echo.

REM Run middleware tests
echo Running middleware tests...
call npx jest src/tests/middleware.test.ts --verbose
if %ERRORLEVEL% neq 0 (
  echo Middleware tests failed!
  exit /b 1
)
echo Middleware tests passed!
echo.

REM Run component tests
echo Running component tests...
call npx jest src/tests/components/admin/participant-access-button.test.tsx --verbose
if %ERRORLEVEL% neq 0 (
  echo Component tests failed!
  exit /b 1
)
echo Component tests passed!
echo.

REM Run page tests
echo Running page tests...
call npx jest src/tests/app/dashboard/reset-password/page.test.tsx src/tests/app/access-expired/page.test.tsx --verbose
if %ERRORLEVEL% neq 0 (
  echo Page tests failed!
  exit /b 1
)
echo Page tests passed!
echo.

REM All tests passed
echo All participant login tests passed!