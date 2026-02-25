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
  ESTJ: 'The Organizer - You excel at creating structured financial systems and take pride in efficiency. You make decisions based on proven methods and practical outcomes. Your strength lies in disciplined execution and maintaining control over your finances. You feel most confident when you have clear plans, timelines, and metrics to track your progress.',

  ESTP: 'The Opportunist - You thrive on spotting immediate financial opportunities and taking calculated risks. You prefer action over lengthy planning and trust your ability to adapt quickly. Your strength is leveraging market timing and real-world experience. You work best with flexible strategies that allow you to pivot when you see a better opportunity.',

  ESFJ: 'The Provider - You find deep satisfaction in using money to care for and support your loved ones. Financial security for your family and community is your primary driver. Your strength lies in building stable foundations and creating safety nets. You feel most fulfilled when your financial decisions benefit the people you care about.',

  ESFP: 'The Enthusiast - You believe money should enhance life experiences and meaningful connections. You prioritize enjoying the present while building for tomorrow. Your strength is finding joy in the journey and creating memorable moments. You thrive when you can balance spontaneity with smart financial choices that don\'t restrict your lifestyle.',

  ENTJ: 'The Strategist - You view money as a powerful tool for achieving ambitious long-term goals. You naturally think in systems and leverage resources strategically. Your strength lies in creating comprehensive plans and executing with confidence. You excel when given big-picture objectives and the autonomy to optimize your approach.',

  ENTP: 'The Innovator - You love exploring unconventional financial strategies and testing new investment ideas. You see patterns others miss and enjoy intellectual challenges. Your strength is adaptability and creative problem-solving in complex situations. You thrive when experimenting with multiple income streams and cutting-edge opportunities.',

  ENFJ: 'The Idealist - Your financial decisions are deeply connected to your values and desire to make a positive impact. You naturally consider how money affects relationships and community. Your strength lies in aligning resources with purpose and inspiring others. You feel most aligned when your spending and investing reflect your vision for a better world.',

  ENFP: 'The Dreamer - You invest in personal growth, possibilities, and experiences that fuel your passions. Financial freedom means having options to pursue what excites you. Your strength is seeing potential everywhere and maintaining optimism. You work best with flexible frameworks that support your diverse interests and evolving goals.',

  ISTJ: 'The Guardian - You build wealth through methodical planning, consistency, and time-tested principles. You value security, tradition, and doing things the proven way. Your strength lies in discipline, thoroughness, and following through on commitments. You excel with structured plans, detailed budgets, and reliable long-term strategies.',

  ISTP: 'The Pragmatist - You focus on practical, hands-on financial management that delivers tangible results. You prefer understanding exactly how things work before committing. Your strength is efficiency and cutting through complexity to what matters. You thrive with tools and systems you can control directly, avoiding unnecessary overhead.',

  ISFJ: 'The Protector - You save diligently and plan carefully to ensure security for yourself and those you care about. You value loyalty, stability, and helping others in meaningful ways. Your strength lies in consistent habits and protective planning. You feel most comfortable with conservative, proven approaches that minimize risk to your foundation.',

  ISFP: 'The Artist - You make financial choices that reflect your personal values and authentic self. Beauty, meaning, and harmony guide your decisions more than convention. Your strength is staying true to yourself and creating a lifestyle that feels right. You work best when given freedom to spend on what truly matters to you.',

  INTJ: 'The Architect - You design comprehensive financial systems based on data, logic, and long-term projections. You trust your analysis and commit fully to well-researched strategies. Your strength lies in strategic thinking and systematic optimization. You excel when you can build custom frameworks tailored to your unique goals and risk tolerance.',

  INTP: 'The Analyst - You approach money with intellectual curiosity, studying concepts deeply before acting. You seek to understand underlying principles and optimize based on logic. Your strength is analytical rigor and finding inefficiencies others overlook. You thrive when given complex problems to solve and freedom to explore unconventional solutions.',

  INFJ: 'The Counselor - You seek financial harmony with your life purpose and long-term vision. You plan carefully for meaningful futures while staying attuned to deeper motivations. Your strength lies in holistic thinking and aligning resources with values. You feel most aligned when money serves your personal growth and contributes to something larger than yourself.',

  INFP: 'The Seeker - You want every financial decision to reflect your core ideals and authentic values. Conventional success matters less than living in alignment with who you are. Your strength is maintaining integrity and staying true to your principles. You work best when you understand how money can support your unique path and creative expression.',
};

// Map MBTI type to coaching approach
export const coachingApproaches: Record<string, string> = {
  ESTJ: 'I\'ll provide you with clear, step-by-step action plans with specific deadlines and measurable milestones. We\'ll build efficient systems, track progress with concrete metrics, and focus on proven strategies that deliver results. You\'ll get structured check-ins and direct feedback on your execution.',

  ESTP: 'We\'ll focus on immediate, tactical wins and opportunities you can act on today. I\'ll help you build flexible strategies that adapt to market changes while maintaining core financial discipline. Expect dynamic guidance that respects your need for autonomy while capitalizing on your instinct for timing.',

  ESFJ: 'I\'ll work with you to create financial plans that protect and provide for the people you care about. We\'ll build security systems that give you peace of mind and explore how your resources can make a meaningful difference. Our coaching will honor your caregiving role while ensuring you don\'t neglect your own financial wellbeing.',

  ESFP: 'Together, we\'ll design a financial plan that supports your vibrant lifestyle without sacrificing long-term stability. I\'ll help you find the sweet spot between enjoying life now and building for tomorrow. Expect practical strategies that feel natural, not restrictive, so money enhances rather than limits your experiences.',

  ENTJ: 'I\'ll partner with you to develop ambitious, comprehensive financial strategies aligned with your long-term vision. We\'ll create scalable systems, leverage optimization opportunities, and focus on high-impact moves. You\'ll get strategic frameworks with the autonomy to execute them your way, plus data-driven insights to fuel your decisions.',

  ENTP: 'We\'ll explore innovative financial strategies and experiment with multiple approaches to find what works best. I\'ll challenge your thinking, introduce unconventional ideas, and help you test theories in controlled ways. Expect intellectual engagement, creative problem-solving, and freedom to explore diverse opportunities.',

  ENFJ: 'I\'ll help you align your financial decisions with your deepest values and vision for positive impact. We\'ll explore conscious investing, values-based spending, and how money can serve your purpose. Our work will connect your resources to meaning while ensuring you build the foundation needed to sustain your contributions.',

  ENFP: 'Together, we\'ll create flexible financial frameworks that support all your interests and evolving passions. I\'ll help you channel your enthusiasm into sustainable strategies without boxing you in. Expect creative solutions, growth-focused investing, and permission to pursue what lights you up while building real financial freedom.',

  ISTJ: 'I\'ll provide you with detailed, proven financial systems and step-by-step implementation plans. We\'ll use time-tested strategies, thorough analysis, and careful risk management. You\'ll get comprehensive documentation, regular reviews, and reliable guidance you can trust for the long haul.',

  ISTP: 'We\'ll cut through complexity to focus on practical, efficient strategies you can implement yourself. I\'ll show you exactly how everything works, give you direct control over your systems, and eliminate unnecessary overhead. Expect hands-on tools, logical explanations, and straightforward approaches that deliver results.',

  ISFJ: 'I\'ll work with you gently and patiently to build strong financial foundations that protect what matters most. We\'ll use conservative, proven strategies that prioritize security and minimize risk. Our approach will respect your cautious nature while gradually expanding your comfort zone at your own pace.',

  ISFP: 'Together, we\'ll create a personalized financial path that honors your unique values and authentic self. I\'ll help you make choices that feel right, not just look good on paper. Expect freedom to spend on what brings you meaning, creative approaches to wealth-building, and respect for your individual journey.',

  INTJ: 'I\'ll collaborate with you to design comprehensive, custom financial frameworks based on rigorous analysis and data. We\'ll build sophisticated systems optimized for your specific goals and risk profile. You\'ll get strategic models, logical frameworks, and the independence to execute your vision with precision.',

  INTP: 'We\'ll dive deep into financial concepts, exploring underlying principles and optimizing based on logic. I\'ll provide intellectual challenges, unconventional solutions, and freedom to analyze before acting. Expect thorough explanations, complex problem-solving, and respect for your need to understand the "why" behind every recommendation.',

  INFJ: 'I\'ll help you create financial harmony between your resources and life purpose, connecting money to meaning. We\'ll develop holistic strategies that serve your long-term vision while honoring your need for alignment. Our work will integrate your financial, personal, and spiritual growth into a cohesive path forward.',

  INFP: 'Together, we\'ll ensure every financial decision reflects your core values and supports your authentic path. I\'ll help you build wealth in ways that feel true to who you are, not who you "should" be. Expect reflective guidance, creative solutions, and permission to define success on your own terms.',
};
