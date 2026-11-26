export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';
export type TopicStatus = 'not_started' | 'learning' | 'practicing' | 'completed';

export interface Profile {
  degree: string;
  college: string;
  year: string;
  semester: string;
  batch: string;
  cgpa: string;
  progLevel: string;
  python: string;
  java: string;
  c: string;
  dsa: string;
  interests: string;
  careerObjective: string;
  dailyHours: number;
  preferredTimings: string;
  learningBudget: string;
  laptop: string;
  preferredMethod: string;
  setupComplete: boolean;
  darkMode: boolean;
  notifications: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  status: TopicStatus;
}

export interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface StudyMaterial {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  size: number;
  addedAt: string;
  tag: 'notes' | 'pdf' | 'slides' | 'qpapers' | 'other';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  faculty: string;
  syllabus: string;
  units: Unit[];
  internalMarks: string;
  prepPercentage: number;
  difficult: boolean;
  attendance: number;
  materials: StudyMaterial[];
}

export interface Semester {
  id: string;
  name: string;
  active: boolean;
  subjects: Subject[];
}

export interface AcademicYear {
  id: string;
  name: string;
  semesters: Semester[];
}

export interface Exam {
  id: string;
  name: string;
  type: 'internal' | 'midterm' | 'practical' | 'semester_end' | 'lab' | 'viva' | 'other';
  subjectId: string;
  date: string;
  time: string;
  syllabus: string;
  totalMarks: number;
  prepStatus: number;
  difficulty: Difficulty;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  priority: Priority;
  difficulty: Difficulty;
  status: TaskStatus;
  notes: string;
  completed: boolean;
  subjectId: string;
}

export interface Project {
  id: string;
  title: string;
  type: string;
  deadline: string;
  completion: number;
  notes: string;
  links: string;
}

export interface RevisionItem {
  id: string;
  topic: string;
  subjectId: string;
  originalDate: string;
  revisions: { label: string; date: string; done: boolean }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  aiGenerated: boolean;
}

export interface QuizResult {
  id: string;
  category: string;
  score: number;
  total: number;
  date: string;
  weakTopics: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'study' | 'assignment' | 'revision' | 'project' | 'other';
  time: string;
}

export interface StudyLog {
  date: string;
  hours: number;
}

export interface RoadmapTopic {
  id: string;
  name: string;
  status: TopicStatus;
  resources: string;
}

export interface RoadmapLevel {
  id: string;
  title: string;
  topics: RoadmapTopic[];
}

export interface AppState {
  profile: Profile;
  academicYears: AcademicYear[];
  exams: Exam[];
  tasks: Task[];
  projects: Project[];
  revisions: RevisionItem[];
  quizResults: QuizResult[];
  events: CalendarEvent[];
  studyLogs: StudyLog[];
  progRoadmap: RoadmapLevel[];
  aiRoadmap: RoadmapLevel[];
  careerTargets: { id: string; area: string; target: string; done: boolean }[];
}
