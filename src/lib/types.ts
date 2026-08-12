export type Role = "poster" | "worker" | "admin";

export type TaskStatus =
  | "OPEN"
  | "BIDDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CONFIRMED"
  | "PAID"
  | "CANCELLED";

export const STATUS_FLOW: TaskStatus[] = [
  "OPEN",
  "BIDDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CONFIRMED",
  "PAID",
];

export type VerificationStatus = "NOT_VERIFIED" | "PENDING" | "VERIFIED";

export const CATEGORIES = [
  "Documents & Office",
  "Parcel & Delivery",
  "Shopping",
  "Local Errands",
  "Home Services",
  "Business Tasks",
  "Education",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIVISIONS: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail"],
  Rajshahi: ["Pabna", "Rajshahi", "Bogura", "Sirajganj"],
  Chattogram: ["Chattogram", "Cumilla", "Cox's Bazar"],
  Khulna: ["Khulna", "Jashore", "Kushtia"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj"],
  Barishal: ["Barishal", "Patuakhali"],
};

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  division: string;
  role: Role;
  avatar: string;
  bio: string;
  skills: string[];
  serviceCategories: Category[];
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  completedTasks: number;
  earnings: number;
  spending: number;
  verification: VerificationStatus;
  joinedAt: string;
  suspended: boolean;
  available: boolean;
  online: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  division: string;
  city: string;
  area: string;
  budget: number;
  deadline: string;
  preferredGender: "Any" | "Male" | "Female";
  skills: string[];
  attachment?: string;
  instructions?: string;
  posterId: string;
  workerId?: string;
  status: TaskStatus;
  createdAt: string;
  agreedAmount?: number;
}

export interface Bid {
  id: string;
  taskId: string;
  workerId: string;
  price: number;
  estimatedTime: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachment?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: [string, string];
  taskId?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  taskId: string;
  posterId: string;
  workerId: string;
  amount: number;
  serviceFee: number;
  total: number;
  method: "bKash (Demo)" | "Nagad (Demo)" | "Card (Demo)";
  status: "PENDING" | "PAID";
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: "task" | "user";
  targetId: string;
  category: string;
  details: string;
  status: "OPEN" | "REVIEWED" | "DISMISSED";
  createdAt: string;
}

export interface DB {
  users: User[];
  tasks: Task[];
  bids: Bid[];
  messages: Message[];
  conversations: Conversation[];
  notifications: Notification[];
  reviews: Review[];
  payments: Payment[];
  reports: Report[];
}
