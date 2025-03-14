-- Insert a test profile for the first application
INSERT INTO participants (
  application_id,
  retreat_date,
  husband_first_name,
  husband_last_name,
  husband_email,
  wife_first_name,
  wife_last_name,
  wife_email,
  fee_amount,
  has_payment_plan,
  payment_plan_type,
  payment_cadence,
  number_of_payments,
  created_at
)
SELECT 
  id as application_id,
  '2025-03-05' as retreat_date,
  his_name->>'first' as husband_first_name,
  his_name->>'last' as husband_last_name,
  his_email as husband_email,
  her_name->>'first' as wife_first_name,
  her_name->>'last' as wife_last_name,
  her_email as wife_email,
  3500.00 as fee_amount,
  false as has_payment_plan,
  null as payment_plan_type,
  null as payment_cadence,
  null as number_of_payments,
  NOW() as created_at
FROM applications
WHERE id = (SELECT id FROM applications WHERE his_name->>'first' = 'sdas' LIMIT 1);

-- Update the application to mark profile as created
UPDATE applications
SET profile_created = true
WHERE id = (SELECT id FROM applications WHERE his_name->>'first' = 'sdas' LIMIT 1);