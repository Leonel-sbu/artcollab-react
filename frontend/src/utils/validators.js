export const isRequired = (value) =>
  value !== null && value !== undefined && value !== '';

export const isEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const minLength = (value, length) =>
  typeof value === 'string' && value.length >= length;

export const isNumber = (value) =>
  !isNaN(parseFloat(value)) && isFinite(value);

export const isPositive = (value) =>
  isNumber(value) && Number(value) > 0;

export const validateRegister = ({ name, email, password }) => {
  const errors = {};
  if (!isRequired(name)) errors.name = 'Name is required';
  if (!isEmail(email)) errors.email = 'Invalid email';
  if (!minLength(password, 8)) errors.password = 'Password must be at least 8 characters';
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!isEmail(email)) errors.email = 'Invalid email';
  if (!isRequired(password)) errors.password = 'Password is required';
  return errors;
};

export const validateArtwork = ({ title, price }) => {
  const errors = {};
  if (!isRequired(title)) errors.title = 'Title is required';
  if (!isPositive(price)) errors.price = 'Price must be positive';
  return errors;
};

export const validateCourse = ({ title, description }) => {
  const errors = {};
  if (!isRequired(title)) errors.title = 'Title is required';
  if (!isRequired(description)) errors.description = 'Description is required';
  return errors;
};
