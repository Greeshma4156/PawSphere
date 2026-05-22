export const BADGE_TYPES = {
  FIRST_RESCUE: {
    id: 'first_rescue',
    name: 'First Responder',
    description: 'Completed your first successful stray rescue mission',
    icon: '🎖️'
  },
  STREAK_3: {
    id: 'streak_3',
    name: 'Triple Threat',
    description: 'Rescued animals 3 days in a row',
    icon: '🔥'
  },
  LIFE_SAVER: {
    id: 'life_saver',
    name: 'Life Saver',
    description: 'Completed 10 rescue operations',
    icon: '🏥'
  },
  COMMUNITY_HERO: {
    id: 'community_hero',
    name: 'Community Hero',
    description: 'Earned a 4.8+ rating from 5 separate citizens',
    icon: '🌟'
  },
  GUARDIAN_ANGEL: {
    id: 'guardian_angel',
    name: 'Guardian Angel',
    description: 'Successfully completed a high-severity critical rescue',
    icon: '👼'
  }
};

export const BADGE_LIST = Object.keys(BADGE_TYPES);
