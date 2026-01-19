/**
 * Validation utilities for the E-Learning Platform
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Name validation
export const validateName = (name) => {
  // At least 2 characters, only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
  return nameRegex.test(name.trim());
};

// Course title validation
export const validateCourseTitle = (title) => {
  // Between 5 and 100 characters
  return title && title.trim().length >= 5 && title.trim().length <= 100;
};

// Course description validation
export const validateCourseDescription = (description) => {
  // Between 10 and 1000 characters
  return description && description.trim().length >= 10 && description.trim().length <= 1000;
};

// Price validation
export const validatePrice = (price) => {
  // Positive number
  return !isNaN(price) && parseFloat(price) >= 0;
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

// YouTube URL validation
export const validateYouTubeUrl = (url) => {
  if (!url) return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
};

// Form validation helper
export const validateForm = (fields, rules) => {
  const errors = {};

  for (const field in rules) {
    const value = fields[field];
    const validations = rules[field];

    for (const validation of validations) {
      if (validation.required && (!value || value.toString().trim() === '')) {
        errors[field] = validation.message || `${field} is required`;
        break;
      }

      if (value && validation.validator && !validation.validator(value)) {
        errors[field] = validation.message || `${field} is invalid`;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Error display component
export const ErrorDisplay = ({ errors, field }) => {
  if (!errors || !errors[field]) return null;

  return (
    <div className="text-red-500 text-sm mt-1">
      {errors[field]}
    </div>
  );
};