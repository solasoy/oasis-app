export interface ValidationError {
  field: string;
  message: string;
}

export function validateApplicationForm(formData: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.hisEmail)) {
    errors.push({ field: 'hisEmail', message: 'Please enter a valid email address' });
  }
  if (!emailRegex.test(formData.herEmail)) {
    errors.push({ field: 'herEmail', message: 'Please enter a valid email address' });
  }

  // Phone validation
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (!phoneRegex.test(formData.hisPhone)) {
    errors.push({ field: 'hisPhone', message: 'Please enter phone in format: 123-456-7890' });
  }
  if (!phoneRegex.test(formData.herPhone)) {
    errors.push({ field: 'herPhone', message: 'Please enter phone in format: 123-456-7890' });
  }

  // Required text fields
  const requiredFields = [
    'retreatDate',
    'hisName.first', 'hisName.last',
    'herName.first', 'herName.last',
    'address.line1', 'address.city', 'address.state', 'address.postal',
    'isOCCMember', 'isChristFollower',
    'weddingDate', 'livingArrangement',
    'children', 'previousMarriage',
    'retreatReason', 'previousTherapy'
  ];

  requiredFields.forEach(field => {
    const value = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj?.[key], formData)
      : formData[field];
    
    if (!value || value.trim() === '') {
      errors.push({ field, message: `${field.replace('.', ' ')} is required` });
    }
  });

  return errors;
} 