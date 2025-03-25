-- Create checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'couple' or 'individual'
  required_role TEXT, -- 'husband', 'wife', or NULL (for couple items)
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default checklist items
INSERT INTO checklist_items (title, description, type, required_role, order_index)
VALUES 
  ('Signed Agreement', 'Electronic signature required', 'couple', NULL, 1),
  ('Payment', 'Complete all scheduled payments', 'couple', NULL, 2),
  ('Intake Form', 'Complete personal information', 'individual', 'husband', 3),
  ('Intake Form', 'Complete personal information', 'individual', 'wife', 4),
  ('Food Preferences', 'Indicate dietary restrictions', 'individual', 'husband', 5),
  ('Food Preferences', 'Indicate dietary restrictions', 'individual', 'wife', 6);

-- Create participant progress table
CREATE TABLE IF NOT EXISTS participant_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id),
  checklist_item_id UUID NOT NULL REFERENCES checklist_items(id),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  data JSONB, -- Store any relevant data related to completion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, checklist_item_id)
);

-- Create payment tracking tables
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id),
  payment_cadence TEXT NOT NULL, -- 'weekly', 'bi-weekly', 'monthly'
  number_of_payments INTEGER NOT NULL,
  amount_per_payment DECIMAL NOT NULL,
  remaining_amount DECIMAL(10,2) NOT NULL,
  payment_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL, -- 'scheduled', 'completed', 'missed'
  payment_reference TEXT, -- Reference from payment processor if available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_schedule_id UUID NOT NULL REFERENCES payment_schedule(id),
  notification_type TEXT NOT NULL, -- 'upcoming', 'overdue', 'confirmation'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_status TEXT NOT NULL, -- 'sent', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);