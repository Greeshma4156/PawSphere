export const validateDonationCampaign = (req, res, next) => {
  const { title, description, targetAmount } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Campaign title is required' });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ success: false, error: 'Campaign description is required' });
  }

  if (targetAmount === undefined || typeof targetAmount !== 'number' || targetAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Campaign target amount must be a positive number' });
  }

  next();
};

export const validateDonationPledge = (req, res, next) => {
  const { amount, name } = req.body;

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Donation amount must be a positive number' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Donor name is required' });
  }

  next();
};
