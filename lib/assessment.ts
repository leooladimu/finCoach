import type { AssessmentQuestion } from '@/types';

// 20-question Money Style Assessment
// 5 questions per MBTI dimension, ~3 minutes total
// Disguised as financial decision-making preferences

export const assessmentQuestions: AssessmentQuestion[] = [
  // E vs I: Social vs Private financial decisions
  {
    id: 1,
    dimension: 'EI',
    questionText: 'When making a big financial decision, I prefer to:',
    options: [
      {
        text: 'Always talk it through with friends or family first',
        score: 2, // Strong Extraversion
        description: 'Strongly processes decisions externally',
      },
      {
        text: 'Usually discuss it with others before deciding',
        score: 1, // Moderate Extraversion
        description: 'Moderately external processing',
      },
      {
        text: 'Mix of both - depends on the situation',
        score: 0, // Neutral
        description: 'Balanced approach',
      },
      {
        text: 'Usually think it over privately first',
        score: -1, // Moderate Introversion
        description: 'Moderately internal processing',
      },
      {
        text: 'Always reflect alone before discussing with anyone',
        score: -2, // Strong Introversion
        description: 'Strongly processes decisions internally',
      },
    ],
  },
  {
    id: 2,
    dimension: 'EI',
    questionText: 'My ideal approach to learning about money is:',
    options: [
      {
        text: 'Group workshops and lively discussions',
        score: 2, // Strong Extraversion
        description: 'Strongly energized by social learning',
      },
      {
        text: 'Learning with others, but also some solo time',
        score: 1, // Moderate Extraversion
        description: 'Prefers collaborative learning',
      },
      {
        text: 'Mix of group sessions and independent study',
        score: 0, // Neutral
        description: 'Balanced learning approach',
      },
      {
        text: 'Mostly independent research with occasional input',
        score: -1, // Moderate Introversion
        description: 'Prefers solo learning',
      },
      {
        text: 'Entirely self-directed reading and research',
        score: -2, // Strong Introversion
        description: 'Strongly energized by solo learning',
      },
    ],
  },
  {
    id: 3,
    dimension: 'EI',
    questionText: 'When I receive a bonus or windfall:',
    options: [
      {
        text: 'I immediately want to share the exciting news',
        score: 2, // Strong Extraversion
        description: 'Strongly processes joy externally',
      },
      {
        text: 'I usually tell close friends or family',
        score: 1, // Moderate Extraversion
        description: 'Moderately external processing',
      },
      {
        text: 'I might share with a few people, but keep it low-key',
        score: 0, // Neutral
        description: 'Balanced sharing',
      },
      {
        text: 'I prefer to keep it mostly private',
        score: -1, // Moderate Introversion
        description: 'Moderately internal processing',
      },
      {
        text: 'I always keep it completely private and reflect alone',
        score: -2, // Strong Introversion
        description: 'Strongly processes joy internally',
      },
    ],
  },
  {
    id: 4,
    dimension: 'EI',
    questionText: 'My financial stress is best relieved by:',
    options: [
      {
        text: 'Definitely talking it through with others',
        score: 2, // Strong Extraversion
        description: 'Strongly needs external processing',
      },
      {
        text: 'Usually discussing it with someone I trust',
        score: 1, // Moderate Extraversion
        description: 'Moderately external relief',
      },
      {
        text: 'A combination of talking and solo reflection',
        score: 0, // Neutral
        description: 'Balanced stress relief',
      },
      {
        text: 'Mostly processing it alone',
        score: -1, // Moderate Introversion
        description: 'Moderately internal relief',
      },
      {
        text: 'Always taking time completely alone to decompress',
        score: -2, // Strong Introversion
        description: 'Strongly needs internal processing',
      },
    ],
  },
  {
    id: 5,
    dimension: 'EI',
    questionText: 'What is your current annual household income?',
    options: [
      {
        text: 'Under $50,000',
        score: 0,
        description: 'Income level',
      },
      {
        text: '$50,000 - $100,000',
        score: 0,
        description: 'Income level',
      },
      {
        text: '$100,000 - $200,000',
        score: 0,
        description: 'Income level',
      },
      {
        text: 'Over $200,000',
        score: 0,
        description: 'Income level',
      },
      {
        text: 'Prefer not to say',
        score: 0,
        description: 'Income level',
      },
    ],
  },

  // S vs N: Present vs Future focus
  {
    id: 6,
    dimension: 'SN',
    questionText: 'I feel most confident when my financial plan:',
    options: [
      {
        text: 'Has very specific, actionable steps I can start immediately',
        score: -2, // Strong Sensing
        description: 'Strongly prefers concrete details',
      },
      {
        text: 'Focuses on practical steps and near-term actions',
        score: -1, // Moderate Sensing
        description: 'Moderately prefers concrete planning',
      },
      {
        text: 'Balances concrete steps with long-term vision',
        score: 0, // Neutral
        description: 'Balanced planning approach',
      },
      {
        text: 'Emphasizes future possibilities with some specific goals',
        score: 1, // Moderate Intuition
        description: 'Moderately prefers visionary planning',
      },
      {
        text: 'Paints an inspiring vision of future possibilities',
        score: 2, // Strong Intuition
        description: 'Strongly prefers abstract vision',
      },
    ],
  },
  {
    id: 7,
    dimension: 'SN',
    questionText: 'When tracking my budget, I care most about:',
    options: [
      {
        text: 'Every precise number and exact spending amount',
        score: -2, // Strong Sensing
        description: 'Strongly focus on facts and details',
      },
      {
        text: 'Accurate numbers and specific spending patterns',
        score: -1, // Moderate Sensing
        description: 'Moderately detail-oriented',
      },
      {
        text: 'Both the details and the overall picture',
        score: 0, // Neutral
        description: 'Balanced tracking',
      },
      {
        text: 'General trends and what they suggest',
        score: 1, // Moderate Intuition
        description: 'Moderately pattern-focused',
      },
      {
        text: 'Big-picture trends and future implications',
        score: 2, // Strong Intuition
        description: 'Strongly focus on patterns and meaning',
      },
    ],
  },
  {
    id: 8,
    dimension: 'SN',
    questionText: 'What is your current total debt (excluding mortgage)?',
    options: [
      {
        text: 'No debt',
        score: 0,
        description: 'Debt level',
      },
      {
        text: 'Under $10,000',
        score: 0,
        description: 'Debt level',
      },
      {
        text: '$10,000 - $50,000',
        score: 0,
        description: 'Debt level',
      },
      {
        text: 'Over $50,000',
        score: 0,
        description: 'Debt level',
      },
      {
        text: 'Prefer not to say',
        score: 0,
        description: 'Debt level',
      },
    ],
  },
  {
    id: 9,
    dimension: 'SN',
    questionText: 'When reading about investment opportunities, I:',
    options: [
      {
        text: 'Only trust detailed facts and proven track records',
        score: -2, // Strong Sensing
        description: 'Strongly trust tangible evidence',
      },
      {
        text: 'Prefer historical data and concrete results',
        score: -1, // Moderate Sensing
        description: 'Moderately evidence-based',
      },
      {
        text: 'Want both proven data and future potential',
        score: 0, // Neutral
        description: 'Balanced evaluation',
      },
      {
        text: 'Look for innovative concepts with some evidence',
        score: 1, // Moderate Intuition
        description: 'Moderately possibility-focused',
      },
      {
        text: 'Focus on visionary potential and innovation',
        score: 2, // Strong Intuition
        description: 'Strongly trust possibilities',
      },
    ],
  },
  {
    id: 10,
    dimension: 'SN',
    questionText: 'I trust financial advice that is:',
    options: [
      {
        text: 'Entirely grounded in proven, real-world examples',
        score: -2, // Strong Sensing
        description: 'Strongly values practical application',
      },
      {
        text: 'Based on past experience and concrete evidence',
        score: -1, // Moderate Sensing
        description: 'Moderately practical',
      },
      {
        text: 'Blends proven methods with innovative thinking',
        score: 0, // Neutral
        description: 'Balanced approach',
      },
      {
        text: 'Forward-thinking with some practical grounding',
        score: 1, // Moderate Intuition
        description: 'Moderately innovative',
      },
      {
        text: 'Highly innovative and future-focused',
        score: 2, // Strong Intuition
        description: 'Strongly values novel perspectives',
      },
    ],
  },

  // T vs F: Logic vs Values in money decisions
  {
    id: 11,
    dimension: 'TF',
    questionText: 'When deciding where to spend money, I prioritize:',
    options: [
      {
        text: 'Purely logical analysis and budget optimization',
        score: -2, // Strong Thinking
        description: 'Strongly objective analysis',
      },
      {
        text: 'What makes logical sense based on my budget',
        score: -1, // Moderate Thinking
        description: 'Moderately logic-based',
      },
      {
        text: 'Both practical budget and personal happiness',
        score: 0, // Neutral
        description: 'Balanced decision-making',
      },
      {
        text: 'What aligns with my values, within reason',
        score: 1, // Moderate Feeling
        description: 'Moderately values-based',
      },
      {
        text: 'What truly aligns with my values and brings joy',
        score: 2, // Strong Feeling
        description: 'Strongly values-based',
      },
    ],
  },
  {
    id: 12,
    dimension: 'TF',
    questionText: 'If a friend asked for financial advice, I would:',
    options: [
      {
        text: 'Immediately analyze their data and provide solutions',
        score: -2, // Strong Thinking
        description: 'Strongly impersonal, problem-solving',
      },
      {
        text: 'Objectively analyze and suggest practical solutions',
        score: -1, // Moderate Thinking
        description: 'Moderately analytical',
      },
      {
        text: 'Listen to their feelings while also analyzing facts',
        score: 0, // Neutral
        description: 'Balanced approach',
      },
      {
        text: 'Understand their feelings, then discuss options',
        score: 1, // Moderate Feeling
        description: 'Moderately empathetic',
      },
      {
        text: 'Deeply empathize first, supporting them emotionally',
        score: 2, // Strong Feeling
        description: 'Strongly personal, empathetic',
      },
    ],
  },
  {
    id: 13,
    dimension: 'TF',
    questionText: 'How much do you currently have in emergency savings?',
    options: [
      {
        text: 'Less than $1,000',
        score: 0,
        description: 'Emergency fund level',
      },
      {
        text: '$1,000 - $5,000',
        score: 0,
        description: 'Emergency fund level',
      },
      {
        text: '$5,000 - $20,000',
        score: 0,
        description: 'Emergency fund level',
      },
      {
        text: 'Over $20,000',
        score: 0,
        description: 'Emergency fund level',
      },
      {
        text: 'Prefer not to say',
        score: 0,
        description: 'Emergency fund level',
      },
    ],
  },
  {
    id: 14,
    dimension: 'TF',
    questionText: 'When I have to cut spending, I feel worst about giving up:',
    options: [
      {
        text: 'Items with poor ROI - I cut logically without emotion',
        score: -2, // Strong Thinking
        description: 'Strongly logical analysis',
      },
      {
        text: 'Things that are inefficient or wasteful',
        score: -1, // Moderate Thinking
        description: 'Moderately logical',
      },
      {
        text: 'It depends on both efficiency and emotional value',
        score: 0, // Neutral
        description: 'Balanced consideration',
      },
      {
        text: 'Things that bring me or others joy',
        score: 1, // Moderate Feeling
        description: 'Moderately emotional',
      },
      {
        text: 'Anything that deeply matters to people I care about',
        score: 2, // Strong Feeling
        description: 'Strongly emotional and relational',
      },
    ],
  },
  {
    id: 15,
    dimension: 'TF',
    questionText: 'Financial success means:',
    options: [
      {
        text: 'Maximizing net worth and hitting quantifiable targets',
        score: -2, // Strong Thinking
        description: 'Strongly objective metrics',
      },
      {
        text: 'Achieving measurable goals and growing wealth',
        score: -1, // Moderate Thinking
        description: 'Moderately metric-focused',
      },
      {
        text: 'Both achieving goals and living according to values',
        score: 0, // Neutral
        description: 'Balanced success definition',
      },
      {
        text: 'Living aligned with my values while building security',
        score: 1, // Moderate Feeling
        description: 'Moderately values-focused',
      },
      {
        text: 'Creating a life of meaning, purpose, and helping others',
        score: 2, // Strong Feeling
        description: 'Strongly subjective quality',
      },
    ],
  },

  // J vs P: Structure vs Flexibility
  {
    id: 16,
    dimension: 'JP',
    questionText: 'My approach to financial planning is:',
    options: [
      {
        text: 'Create a highly detailed plan and strictly follow it',
        score: -2, // Strong Judging
        description: 'Strongly prefers structure',
      },
      {
        text: 'Make a solid plan and generally stick to it',
        score: -1, // Moderate Judging
        description: 'Moderately structured',
      },
      {
        text: 'Create a flexible framework that allows adjustments',
        score: 0, // Neutral
        description: 'Balanced planning',
      },
      {
        text: 'Keep options open with a loose plan',
        score: 1, // Moderate Perceiving
        description: 'Moderately flexible',
      },
      {
        text: 'Stay completely flexible and adapt as life unfolds',
        score: 2, // Strong Perceiving
        description: 'Strongly prefers flexibility',
      },
    ],
  },
  {
    id: 17,
    dimension: 'JP',
    questionText: 'When managing my money, I feel best when:',
    options: [
      {
        text: 'Every penny is tracked and perfectly organized',
        score: -2, // Strong Judging
        description: 'Strongly needs order',
      },
      {
        text: 'Everything is organized and accounted for',
        score: -1, // Moderate Judging
        description: 'Moderately structured',
      },
      {
        text: 'I have general organization with some flexibility',
        score: 0, // Neutral
        description: 'Balanced approach',
      },
      {
        text: 'I have freedom to make spontaneous choices',
        score: 1, // Moderate Perceiving
        description: 'Moderately flexible',
      },
      {
        text: 'I have complete freedom without rigid constraints',
        score: 2, // Strong Perceiving
        description: 'Strongly needs flexibility',
      },
    ],
  },
  {
    id: 18,
    dimension: 'JP',
    questionText: 'How do you typically handle bill payments?',
    options: [
      {
        text: 'Everything on auto-pay, scheduled far in advance',
        score: -2, // Strong Judging
        description: 'Strongly prefers predetermined systems',
      },
      {
        text: 'Auto-pay or scheduled ahead of time',
        score: -1, // Moderate Judging
        description: 'Moderately systematic',
      },
      {
        text: 'Mix of auto-pay and manual payments',
        score: 0, // Neutral
        description: 'Balanced approach',
      },
      {
        text: 'Usually pay manually as bills come',
        score: 1, // Moderate Perceiving
        description: 'Moderately flexible',
      },
      {
        text: 'Always pay manually when I get around to it',
        score: 2, // Strong Perceiving
        description: 'Strongly prefers flexible approach',
      },
    ],
  },
  {
    id: 19,
    dimension: 'JP',
    questionText: 'What percentage of your income are you currently saving?',
    options: [
      {
        text: 'Less than 5%',
        score: 0,
        description: 'Savings rate',
      },
      {
        text: '5% - 15%',
        score: 0,
        description: 'Savings rate',
      },
      {
        text: '15% - 25%',
        score: 0,
        description: 'Savings rate',
      },
      {
        text: 'Over 25%',
        score: 0,
        description: 'Savings rate',
      },
      {
        text: 'Prefer not to say',
        score: 0,
        description: 'Savings rate',
      },
    ],
  },
  {
    id: 20,
    dimension: 'JP',
    questionText: 'Deadlines for financial goals make me feel:',
    options: [
      {
        text: 'Highly motivated - I thrive on clear deadlines',
        score: -2, // Strong Judging
        description: 'Strongly energized by structure',
      },
      {
        text: 'Motivated and focused',
        score: -1, // Moderate Judging
        description: 'Moderately structured',
      },
      {
        text: 'They can be helpful but not essential',
        score: 0, // Neutral
        description: 'Balanced view',
      },
      {
        text: 'Somewhat constrained - I prefer flexibility',
        score: 1, // Moderate Perceiving
        description: 'Moderately flexible',
      },
      {
        text: 'Very stressed - I need open-ended freedom',
        score: 2, // Strong Perceiving
        description: 'Strongly prefers openness',
      },
    ],
  },
];

// Map MBTI type to Money Style descriptions
export const moneyStyleDescriptions: Record<string, string> = {
  ESTJ: 'The Organizer - You thrive on structure and clear financial systems. You value efficiency and practical results.',
  ESTP: 'The Opportunist - You spot chances to leverage money in the moment. You prefer action over lengthy planning.',
  ESFJ: 'The Provider - You prioritize financial security for your loved ones. Giving and supporting others motivates you.',
  ESFP: 'The Enthusiast - You enjoy spending on experiences and people. You believe money should enhance life now.',
  ENTJ: 'The Strategist - You see money as a tool for achieving ambitious goals. Long-term vision drives your decisions.',
  ENTP: 'The Innovator - You explore creative financial opportunities. You love testing new approaches to wealth building.',
  ENFJ: 'The Idealist - You align spending with your values and community impact. Purpose matters more than profit.',
  ENFP: 'The Dreamer - You invest in possibilities and personal growth. Financial freedom means pursuing your passions.',
  ISTJ: 'The Guardian - You build wealth through careful planning and discipline. Tradition and stability guide you.',
  ISTP: 'The Pragmatist - You focus on what works efficiently. You prefer hands-on financial management.',
  ISFJ: 'The Protector - You save diligently to ensure security. You value loyalty and helping others quietly.',
  ISFP: 'The Artist - You spend on what brings beauty and meaning. Financial choices reflect your personal values.',
  INTJ: 'The Architect - You design comprehensive financial systems. You trust data and long-term projections.',
  INTP: 'The Analyst - You study financial concepts deeply. You optimize based on logical principles.',
  INFJ: 'The Counselor - You seek financial harmony with your life purpose. You plan carefully for meaningful futures.',
  INFP: 'The Seeker - You want your money to reflect your ideals. Authenticity matters more than convention.',
};

// Map MBTI type to coaching approach
export const coachingApproaches: Record<string, string> = {
  ESTJ: 'Direct, structured guidance with clear action steps and measurable outcomes.',
  ESTP: 'Dynamic, opportunity-focused coaching with immediate tactical wins.',
  ESFJ: 'Supportive, relationship-centered guidance that honors your caregiving role.',
  ESFP: 'Energizing, present-focused coaching that balances enjoyment with goals.',
  ENTJ: 'Strategic, ambitious guidance aligned with your vision of success.',
  ENTP: 'Exploratory, innovative coaching that encourages testing new ideas.',
  ENFJ: 'Inspirational, values-driven guidance that connects money to purpose.',
  ENFP: 'Creative, possibility-focused coaching that supports your diverse interests.',
  ISTJ: 'Methodical, reliable guidance with proven systems and detailed plans.',
  ISTP: 'Practical, efficient coaching focused on what works for you.',
  ISFJ: 'Gentle, protective guidance that respects your cautious nature.',
  ISFP: 'Personalized, values-aligned coaching that honors your unique path.',
  INTJ: 'Analytical, systems-focused guidance with comprehensive frameworks.',
  INTP: 'Conceptual, logic-based coaching that explores underlying principles.',
  INFJ: 'Holistic, meaning-focused guidance that integrates money with life vision.',
  INFP: 'Reflective, authentic coaching that aligns finances with your ideals.',
};
