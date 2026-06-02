export const validateSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
  }

  if (role && !['citizen', 'volunteer'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid user role selected' });
  }

  // Volunteer Onboarding requirements
  if (role === 'volunteer') {
    const { experienceLevel, phone } = req.body;
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required for volunteer onboarding' });
    }
    if (experienceLevel && !['none', 'beginner', 'intermediate', 'expert'].includes(experienceLevel)) {
      return res.status(400).json({ success: false, error: 'Invalid experience level selected' });
    }
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }

  next();
};
