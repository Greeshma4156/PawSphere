export const getElapsedLabel = (createdAt) => {
  if (!createdAt) return '—';
  const t = typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt;
  const delta = Math.max(0, Date.now() - t);
  const mins = Math.floor(delta / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
};

export const useMockLocation = () => ({
  coords: {
    latitude: 12.9716,
    longitude: 77.5946,
  },
});

