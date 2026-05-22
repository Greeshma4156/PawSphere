export const validateRescueReport = (req, res, next) => {
  const { title, animalType, injurySeverity, description, coordinates } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  if (!animalType || !['dog', 'cat', 'bird', 'other'].includes(animalType)) {
    return res.status(400).json({ success: false, error: 'Valid animal type is required' });
  }

  if (injurySeverity && !['low', 'medium', 'high', 'critical'].includes(injurySeverity)) {
    return res.status(400).json({ success: false, error: 'Invalid injury severity level' });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ success: false, error: 'Description is required' });
  }

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({ success: false, error: 'Valid coordinates array [longitude, latitude] is required' });
  }

  const [lng, lat] = coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number' || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return res.status(400).json({ success: false, error: 'Coordinates coordinates out of range' });
  }

  next();
};
