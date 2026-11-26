import type { AppState, Profile } from './types';

export const defaultProfile: Profile = {
  degree: 'B.Tech Computer Science and Engineering',
  college: 'Sri Venkateswara College of Engineering',
  year: '3rd Year',
  semester: '3-1',
  batch: '2024–2028',
  cgpa: '8.57',
  progLevel: 'Beginner',
  python: 'Basic',
  java: 'Basic',
  c: 'Basic',
  dsa: 'Beginner',
  interests: 'Artificial Intelligence, Python, Machine Learning, Software Development',
  careerObjective: 'Get a high-paying software engineering or AI-related job',
  dailyHours: 2,
  preferredTimings: 'Evening',
  learningBudget: 'Free resources preferred',
  laptop: 'MacBook Air M3',
  preferredMethod: 'Step-by-step explanations, practical examples, coding exercises, quizzes and revision',
  setupComplete: false,
  darkMode: true,
  notifications: false,
};

const id = () => Math.random().toString(36).slice(2, 10);

export const demoState: AppState = {
  profile: { ...defaultProfile },
  academicYears: [
    {
      id: id(),
      name: '2024–2028',
      semesters: [
        {
          id: id(),
          name: '3-1',
          active: true,
          subjects: [
            {
              id: id(),
              name: 'Data Structures and Algorithms',
              code: 'CS301',
              credits: 4,
              faculty: '',
              syllabus: '',
              units: [
                { id: id(), name: 'Unit 1: Introduction', chapters: [{ id: id(), name: 'Arrays', status: 'completed' }, { id: id(), name: 'Strings', status: 'learning' }] },
                { id: id(), name: 'Unit 2: Searching & Sorting', chapters: [{ id: id(), name: 'Linear Search', status: 'not_started' }, { id: id(), name: 'Binary Search', status: 'not_started' }] },
              ],
              internalMarks: '',
              prepPercentage: 35,
              difficult: true,
              attendance: 85,
              materials: [],
            },
            {
              id: id(),
              name: 'Operating Systems',
              code: 'CS302',
              credits: 3,
              faculty: '',
              syllabus: '',
              units: [
                { id: id(), name: 'Unit 1: Introduction', chapters: [{ id: id(), name: 'OS Concepts', status: 'learning' }] },
              ],
              internalMarks: '',
              prepPercentage: 50,
              difficult: false,
              attendance: 90,
              materials: [],
            },
            {
              id: id(),
              name: 'Database Management Systems',
              code: 'CS303',
              credits: 3,
              faculty: '',
              syllabus: '',
              units: [
                { id: id(), name: 'Unit 1: Introduction', chapters: [{ id: id(), name: 'ER Model', status: 'completed' }] },
              ],
              internalMarks: '',
              prepPercentage: 60,
              difficult: false,
              attendance: 92,
              materials: [],
            },
          ],
        },
      ],
    },
  ],
  exams: [
    { id: id(), name: 'DSA Mid-1', type: 'midterm', subjectId: '', date: addDays(14), time: '10:00', syllabus: 'Units 1-2', totalMarks: 25, prepStatus: 40, difficulty: 'hard' },
    { id: id(), name: 'OS Internal', type: 'internal', subjectId: '', date: addDays(7), time: '14:00', syllabus: 'Unit 1', totalMarks: 20, prepStatus: 70, difficulty: 'medium' },
  ],
  tasks: [
    { id: id(), title: 'Practice Python loops', category: 'Programming', description: 'Solve 5 loop problems', date: today(), startTime: '18:00', endTime: '18:45', duration: 45, priority: 'high', difficulty: 'easy', status: 'not_started', notes: '', completed: false, subjectId: '' },
    { id: id(), title: 'Revise DSA Arrays', category: 'Academic', description: 'Review array notes', date: today(), startTime: '19:00', endTime: '19:30', duration: 30, priority: 'high', difficulty: 'medium', status: 'not_started', notes: '', completed: false, subjectId: '' },
    { id: id(), title: 'Watch NumPy tutorial', category: 'AI/ML', description: 'FreeCodeCamp NumPy video', date: today(), startTime: '20:00', endTime: '20:30', duration: 30, priority: 'medium', difficulty: 'easy', status: 'completed', notes: '', completed: true, subjectId: '' },
  ],
  projects: [
    { id: id(), title: 'CSP — Community Survey App', type: 'Community Service Project', deadline: addDays(30), completion: 40, notes: 'Documentation pending', links: '' },
  ],
  revisions: [
    {
      id: id(),
      topic: 'Python Functions',
      subjectId: '',
      originalDate: addDays(-1),
      revisions: [
        { label: '1st (same day)', date: addDays(-1), done: true },
        { label: '2nd (+1d)', date: today(), done: false },
        { label: '3rd (+3d)', date: addDays(2), done: false },
        { label: '4th (+7d)', date: addDays(6), done: false },
        { label: '5th (+14d)', date: addDays(13), done: false },
        { label: '6th (+30d)', date: addDays(29), done: false },
      ],
    },
  ],
  quizResults: [],
  events: [
    { id: id(), title: 'OS Internal Exam', date: addDays(7), type: 'exam', time: '14:00' },
    { id: id(), title: 'CSP Submission', date: addDays(30), type: 'project', time: '23:59' },
  ],
  studyLogs: [
    { date: addDays(-6), hours: 2 },
    { date: addDays(-5), hours: 1.5 },
    { date: addDays(-4), hours: 2 },
    { date: addDays(-3), hours: 0.5 },
    { date: addDays(-2), hours: 2 },
    { date: addDays(-1), hours: 1.5 },
    { date: today(), hours: 1 },
  ],
  progRoadmap: [
    {
      id: id(),
      title: 'Level 1: Python Fundamentals',
      topics: ['Variables and data types', 'Operators', 'Conditions', 'Loops', 'Functions', 'Lists, tuples, dictionaries and sets', 'File handling', 'Exception handling', 'Object-oriented programming'].map(n => ({ id: id(), name: n, status: 'not_started' as const, resources: '' })),
    },
    {
      id: id(),
      title: 'Level 2: Data Structures and Algorithms',
      topics: ['Arrays', 'Strings', 'Searching', 'Sorting', 'Linked lists', 'Stacks', 'Queues', 'Recursion', 'Trees', 'Graphs', 'Dynamic programming'].map(n => ({ id: id(), name: n, status: 'not_started' as const, resources: '' })),
    },
    {
      id: id(),
      title: 'Level 3: Advanced Python and Projects',
      topics: ['Modules and packages', 'APIs', 'Database fundamentals', 'Practical projects', 'Git and GitHub'].map(n => ({ id: id(), name: n, status: 'not_started' as const, resources: '' })),
    },
  ],
  aiRoadmap: [
    {
      id: id(),
      title: 'AI Foundations',
      topics: ['Python for AI', 'Mathematics for Machine Learning', 'Statistics and Probability', 'NumPy', 'Pandas', 'Matplotlib', 'Data Analysis'].map(n => ({ id: id(), name: n, status: 'not_started' as const, resources: '' })),
    },
    {
      id: id(),
      title: 'Machine Learning',
      topics: ['Machine Learning Fundamentals', 'Supervised Learning', 'Unsupervised Learning'].map(n => ({ id: id(), name: n, status: 'not_started' as const, resources: '' })),
    },
    {
      id: id(),
      title: 'Deep Learning & Advanced AI',
      topics: ['Deep Learning', 'Neural Networks', 'Natural Language Processing', 'Generative AI', 'Large Language Models', 'AI Projects', 'Model Deployment'].map(n => ({ id: id(), name: n, status: 'not_started' as const, resources: '' })),
    },
  ],
  careerTargets: [
    { id: id(), area: 'Python programming', target: 'Solve 20 practice problems this week', done: false },
    { id: id(), area: 'DSA', target: 'Complete Arrays & Strings topics', done: false },
    { id: id(), area: 'Aptitude', target: 'Practice 30 aptitude questions', done: false },
    { id: id(), area: 'Resume', target: 'Complete first resume draft', done: false },
  ],
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const sampleQuizQuestions = [
  {
    id: 'q1',
    category: 'Python',
    question: 'Which data type is used to store a sequence of items that cannot be modified?',
    options: ['list', 'tuple', 'dict', 'set'],
    correct: 1,
    explanation: 'A tuple is immutable — once created, its elements cannot be changed.',
    aiGenerated: false,
  },
  {
    id: 'q2',
    category: 'Python',
    question: 'What is the output of: print(2 ** 3)?',
    options: ['6', '8', '9', '23'],
    correct: 1,
    explanation: '** is the exponentiation operator. 2 ** 3 = 2*2*2 = 8.',
    aiGenerated: false,
  },
  {
    id: 'q3',
    category: 'DSA',
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
    correct: 2,
    explanation: 'Binary search halves the search space each step, giving O(log n).',
    aiGenerated: false,
  },
  {
    id: 'q4',
    category: 'DSA',
    question: 'Which data structure works on the LIFO principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correct: 1,
    explanation: 'A Stack follows Last-In-First-Out (LIFO).',
    aiGenerated: false,
  },
  {
    id: 'q5',
    category: 'AI/ML',
    question: 'Which library is primarily used for numerical computing in Python?',
    options: ['Pandas', 'Matplotlib', 'NumPy', 'TensorFlow'],
    correct: 2,
    explanation: 'NumPy provides support for large multi-dimensional arrays and matrices.',
    aiGenerated: false,
  },
  {
    id: 'q6',
    category: 'AI/ML',
    question: 'Supervised learning requires:',
    options: ['Labeled data', 'Unlabeled data', 'No data', 'Only test data'],
    correct: 0,
    explanation: 'Supervised learning trains on input-output pairs (labeled data).',
    aiGenerated: false,
  },
];
