// Client-side Mock Database fallback for LearnPath development
import { User, Session } from "@supabase/supabase-js";

// Check if mock mode is active
export const isMockEnabled = () => {
  if (typeof window === "undefined") return false;
  
  // Explicit toggle in localStorage
  const flag = localStorage.getItem("MOCK_AUTH");
  if (flag === "1") return true;
  if (flag === "0") return false;
  
  // Default to true in development/localhost environments
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || import.meta.env.DEV;
};

// Initial static seed data matching 20260604_complete_schema.sql
const SEED_DATA: Record<string, any[]> = {
  colleges: [
    { id: "college-1", name: "LearnPath Demo University", code: "LPDU", description: "Official demo college for LearnPath", city: "New Delhi", state: "Delhi", is_active: true },
    { id: "college-2", name: "Sunrise College of Technology", code: "SCT", description: "Premier technology college in Bangalore", city: "Bangalore", state: "Karnataka", is_active: true },
    { id: "college-3", name: "National Institute of Commerce", code: "NIC", description: "Top commerce college in Mumbai", city: "Mumbai", state: "Maharashtra", is_active: true }
  ],
  degrees: [
    { id: "degree-bca", college_id: "college-1", name: "Bachelor of Computer Applications", code: "BCA", duration_years: 3, description: "A 3-year undergraduate degree in computer applications", is_active: true },
    { id: "degree-bba", college_id: "college-1", name: "Bachelor of Business Administration", code: "BBA", duration_years: 3, description: "A 3-year undergraduate degree in business administration", is_active: true },
    { id: "degree-bcom", college_id: "college-1", name: "Bachelor of Commerce", code: "BCom", duration_years: 3, description: "A 3-year undergraduate degree in commerce", is_active: true },
    { id: "degree-mca", college_id: "college-1", name: "Master of Computer Applications", code: "MCA", duration_years: 2, description: "A 2-year postgraduate degree in computer applications", is_active: true },
    { id: "degree-mba", college_id: "college-1", name: "Master of Business Administration", code: "MBA", duration_years: 2, description: "A 2-year postgraduate degree in business administration", is_active: true }
  ],
  years: [
    { id: "bca-y1", degree_id: "degree-bca", year_number: 1, label: "Year 1" },
    { id: "bca-y2", degree_id: "degree-bca", year_number: 2, label: "Year 2" },
    { id: "bca-y3", degree_id: "degree-bca", year_number: 3, label: "Year 3" },
    { id: "bba-y1", degree_id: "degree-bba", year_number: 1, label: "Year 1" },
    { id: "bba-y2", degree_id: "degree-bba", year_number: 2, label: "Year 2" },
    { id: "bba-y3", degree_id: "degree-bba", year_number: 3, label: "Year 3" }
  ],
  semesters: [
    { id: "bca-s1", year_id: "bca-y1", semester_number: 1, label: "Semester 1" },
    { id: "bca-s2", year_id: "bca-y1", semester_number: 2, label: "Semester 2" },
    { id: "bca-s3", year_id: "bca-y2", semester_number: 3, label: "Semester 3" },
    { id: "bca-s4", year_id: "bca-y2", semester_number: 4, label: "Semester 4" },
    { id: "bca-s5", year_id: "bca-y3", semester_number: 5, label: "Semester 5" },
    { id: "bca-s6", year_id: "bca-y3", semester_number: 6, label: "Semester 6" },
    { id: "bba-s1", year_id: "bba-y1", semester_number: 1, label: "Semester 1" },
    { id: "bba-s2", year_id: "bba-y1", semester_number: 2, label: "Semester 2" }
  ],
  subjects: [
    { id: "subj-c", semester_id: "bca-s1", name: "Programming in C", code: "BCA101", description: "Introduction to procedural programming concepts using C language.", credits: 4, is_active: true },
    { id: "subj-math", semester_id: "bca-s1", name: "Mathematical Foundations", code: "BCA102", description: "Discrete structures, matrices, relations, and set theory.", credits: 4, is_active: true },
    { id: "subj-co", semester_id: "bca-s1", name: "Computer Organization", code: "BCA103", description: "Basic digital circuits, logic gates, and CPU architecture.", credits: 3, is_active: true },
    { id: "subj-ds", semester_id: "bca-s2", name: "Data Structures & Algorithms", code: "BCA201", description: "Arrays, lists, trees, search, sorting and complexity analysis.", credits: 4, is_active: true },
    { id: "subj-cpp", semester_id: "bca-s2", name: "Object Oriented C++", code: "BCA202", description: "Classes, inheritance, polymorphism, and generic templates.", credits: 4, is_active: true },
    { id: "subj-db", semester_id: "bca-s3", name: "Database Systems", code: "BCA301", description: "Relational database concepts, SQL language, schema design, and normalisation.", credits: 4, is_active: true }
  ],
  books: [
    { id: "book-c", title: "Programming in ANSI C", author: "E. Balagurusamy", edition: "8th Edition", publication: "Tata McGraw-Hill", book_type: "textbook", is_required: true, is_free: true, total_pages: 450, cover_url: "", tags: ["c", "programming", "basics"], description: "The classic introductory textbook on procedural C programming for computer science undergraduates.", degree_id: "degree-bca", semester_id: "bca-s1", is_published: true },
    { id: "book-ds", title: "Data Structures & Algorithms Made Easy", author: "Narasimha Karumanchi", edition: "5th Edition", publication: "CareerMonk", book_type: "reference", is_required: false, is_free: false, total_pages: 585, cover_url: "", tags: ["data structures", "algorithms", "dsa"], description: "Comprehensive handbook solving multiple programming challenge variations on linked lists, recursion, trees, and graphs.", degree_id: "degree-bca", semester_id: "bca-s2", is_published: true },
    { id: "book-cormen", title: "Introduction to Algorithms", author: "Thomas H. Cormen", edition: "3rd Edition", publication: "MIT Press", book_type: "reference", is_required: true, is_free: false, total_pages: 1292, cover_url: "", tags: ["algorithms", "theory"], description: "Core academic reference manual covering mathematical proofing of search and sorting methodologies.", degree_id: "degree-bca", semester_id: "bca-s2", is_published: true },
    { id: "book-mgmt", title: "Principles of Management", author: "Stephen P. Robbins", edition: "14th Edition", publication: "Pearson", book_type: "textbook", is_required: true, is_free: true, total_pages: 380, cover_url: "", tags: ["management", "business"], description: "Foundational theory covering planning, coordination, team building, leadership, and operational controls.", degree_id: "degree-bba", semester_id: "bba-s1", is_published: true }
  ],
  quizzes: [
    { id: "quiz-1", title: "C Syntax & Conditional Loops", description: "Validate variables declarations, loops (for, while), logic statements, and expressions.", subject_id: "subj-c", unit_id: null, college_id: "college-1", quiz_type: "practice", duration_minutes: 15, total_marks: 20, negative_marking: false, negative_mark_value: 0, is_published: true },
    { id: "quiz-2", title: "BCA Semester 1 Math Midterm Mock", description: "Comprehensive practice exam covering set operations, matrix determinants, and logic tables.", subject_id: "subj-math", unit_id: null, college_id: "college-1", quiz_type: "mock_exam", duration_minutes: 60, total_marks: 100, negative_marking: true, negative_mark_value: 0.25, is_published: true }
  ],
  questions: [
    { id: "q-1", quiz_id: "quiz-1", question_text: "Which keyword is used to prevent any changes to a variable in C?", question_type: "mcq", options: ["static", "const", "volatile", "register"], correct_answer: "const", explanation: "The 'const' keyword declares a variable as constant, rendering it read-only.", marks: 5, sort_order: 1 },
    { id: "q-2", quiz_id: "quiz-1", question_text: "What is the size of a float variable in standard 32-bit C compiler environments?", question_type: "mcq", options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"], correct_answer: "4 bytes", explanation: "Floats follow IEEE 754 formats, taking up 4 bytes (32 bits) of memory space.", marks: 5, sort_order: 2 },
    { id: "q-3", quiz_id: "quiz-1", question_text: "Which of the following is correct format specifier for a double value in scanf()?", question_type: "mcq", options: ["%f", "%d", "%lf", "%s"], correct_answer: "%lf", explanation: "While printf can print double values using %f, scanf requires %lf to properly store double precision floats.", marks: 10, sort_order: 3 }
  ],
  news: [
    { id: "news-1", title: "LearnPath Demo University Launches Applied Artificial Intelligence Certificate", content: "LearnPath Demo University is launching a new 6-month evening certification program in Applied AI and Deep Learning next semester. Registration opens on the student portal from June 15th.", category: "academic", is_published: true, created_at: new Date().toISOString() },
    { id: "news-2", title: "Semester Term-End Examinations Schedule Released", content: "The official academic office has scheduled BCA and BBA term-end theory assessments starting June 26th. Direct schedules are updated on students dashboards. Carry valid physical registration cards.", category: "exam", is_published: true, created_at: new Date().toISOString() }
  ],
  notifications: [
    { id: "notif-1", title: "Registration Request Status", message: "Your enrolment profile at LearnPath Demo University is approved! Access course subjects.", target_user_id: "mock-user-123", is_read: false, created_at: new Date().toISOString() },
    { id: "notif-2", title: "Mock Exam Active", message: "A new BCA Math midterm mockup exam is active. Complete it before June 20th.", target_user_id: "mock-user-123", is_read: false, created_at: new Date().toISOString() }
  ],
  subscription_plans: [
    { id: "plan-free", name: "Free Basic Tier", slug: "free", price_monthly: 0, price_total: 0, currency: "INR", duration_days: null, features: ["Access to free lectures", "Basic quizzes", "Community support"], is_active: true },
    { id: "plan-pro", name: "Student Pro Package", slug: "student-pro", price_monthly: 299, price_total: 2499, currency: "INR", duration_days: 365, features: ["All video lectures", "All notes & PPTs", "Unlimited mock tests", "AI doubt solver", "GPA calculator", "Digital library", "Priority support"], is_active: true },
    { id: "plan-inst", name: "Institutional License", slug: "institution", price_monthly: 0, price_total: 9999, currency: "INR", duration_days: 365, features: ["Everything in Pro", "Faculty management", "College branding", "Analytics dashboard", "Bulk user management", "Dedicated support"], is_active: true }
  ],
  profiles: [
    { id: "profile-1", user_id: "mock-user-123", full_name: "Ayush Singh", email: "ayushsinghrawat76456@gmail.com", phone: "+91 98765 43210", college_id: "college-1", approval_status: "approved" }
  ],
  user_roles: [
    { id: "role-1", user_id: "mock-user-123", role: "admin" },
    { id: "role-2", user_id: "mock-user-123", role: "student" }
  ],
  bookmarks: [],
  quiz_attempts: [],
  timetable_entries: [
    { id: "tt-1", user_id: "mock-user-123", subject_name: "Programming in C", teacher_name: "Dr. Ramesh Sharma", day_of_week: 1, start_time: "09:00", end_time: "10:30", room: "Lab 3", color: "#00e5ff" },
    { id: "tt-2", user_id: "mock-user-123", subject_name: "Mathematical Foundations", teacher_name: "Prof. S. K. Gupta", day_of_week: 1, start_time: "11:00", end_time: "12:30", room: "Room 402", color: "#b0c6ff" },
    { id: "tt-3", user_id: "mock-user-123", subject_name: "Computer Organization", teacher_name: "Dr. Ananya Roy", day_of_week: 2, start_time: "09:00", end_time: "10:30", room: "Room 101", color: "#22ef7e" }
  ],
  study_sessions: [
    { id: "ss-1", user_id: "mock-user-123", subject_id: "subj-c", duration_minutes: 45, session_date: new Date().toISOString().split("T")[0] }
  ],
  attendance: [
    { id: "att-1", student_id: "mock-user-123", subject_id: "subj-c", date: new Date().toISOString().split("T")[0], status: "present" }
  ],
  user_subscriptions: [
    { id: "sub-1", user_id: "mock-user-123", plan_id: "plan-pro", status: "active", starts_at: new Date().toISOString(), expires_at: new Date(Date.now() + 365 * 24 * 3600000).toISOString() }
  ]
};

// Initialize localStorage with seed data if not present
const getStoredTable = (tableName: string): any[] => {
  const key = `MOCK_DB_${tableName.toUpperCase()}`;
  const local = localStorage.getItem(key);
  if (local) {
    try { return JSON.parse(local); } catch { /* ignore */ }
  }
  const seed = SEED_DATA[tableName] || [];
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
};

const setStoredTable = (tableName: string, data: any[]) => {
  const key = `MOCK_DB_${tableName.toUpperCase()}`;
  localStorage.setItem(key, JSON.stringify(data));
};

// Interceptor for Postgrest-like API
class MockQueryBuilder {
  private tableName: string;
  private data: any[];
  private filters: ((item: any) => boolean)[] = [];
  private orderField: string | null = null;
  private orderAscending = true;
  private limitCount: number | null = null;
  private singleRecord = false;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.data = [...getStoredTable(tableName)];
  }

  select(fields?: string) {
    return this;
  }

  eq(field: string, value: any) {
    // Nested relationship mocks
    if (field === "years.degree_id") {
      const years = getStoredTable("years");
      this.filters.push((item) => {
        const year = years.find(y => y.id === item.year_id);
        return year && year.degree_id === value;
      });
      return this;
    }
    this.filters.push((item) => item[field] === value);
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push((item) => item[field] !== value);
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push((item) => values.includes(item[field]));
    return this;
  }

  order(field: string, { ascending = true } = {}) {
    this.orderField = field;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleRecord = true;
    return this;
  }

  maybeSingle() {
    this.singleRecord = true;
    return this;
  }

  // Write actions
  async insert(values: any | any[]) {
    const list = Array.isArray(values) ? values : [values];
    const items = list.map(item => ({
      id: item.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...item
    }));
    this.data.push(...items);
    setStoredTable(this.tableName, this.data);
    return { data: Array.isArray(values) ? items : items[0], error: null };
  }

  async update(values: any) {
    // Apply filters first
    const matched: any[] = [];
    const updatedData = this.data.map(item => {
      let matches = true;
      for (const fn of this.filters) {
        if (!fn(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        const newItem = { ...item, ...values, updated_at: new Date().toISOString() };
        matched.push(newItem);
        return newItem;
      }
      return item;
    });

    this.data = updatedData;
    setStoredTable(this.tableName, this.data);
    return { data: this.singleRecord ? matched[0] || null : matched, error: null };
  }

  async delete() {
    const matched: any[] = [];
    const remainingData = this.data.filter(item => {
      let matches = true;
      for (const fn of this.filters) {
        if (!fn(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        matched.push(item);
        return false;
      }
      return true;
    });

    this.data = remainingData;
    setStoredTable(this.tableName, this.data);
    return { data: matched, error: null };
  }

  // Promise support (making it awaitable)
  then(onfulfilled: any, onrejected?: any) {
    let result = [...this.data];
    
    // Apply filters
    for (const filterFn of this.filters) {
      result = result.filter(filterFn);
    }

    // Apply sorting
    if (this.orderField) {
      result.sort((a, b) => {
        const valA = a[this.orderField!];
        const valB = b[this.orderField!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    const payload = this.singleRecord ? (result[0] || null) : result;
    return Promise.resolve({ data: payload, error: null }).then(onfulfilled, onrejected);
  }
}

// Intercept fetch calls for edge functions
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : "";
    
    if (isMockEnabled() && urlStr.includes("/functions/v1/ai-doubt-solver")) {
      console.log("🤖 Intercepted AI doubt solver request, returning mock answer...");
      
      try {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const messages = body.messages || [];
        const lastMsg = messages[messages.length - 1]?.content || "";
        
        let responseText = `Here is a simulated response to your question: "${lastMsg}".\n\nIn development mode, we use this mock AI answer. Once Supabase is fully configured, this will query your active AI edge function.`;
        if (body.mode === "code") {
          responseText = `### Code Explanation\nYour C/C++ code appears correct. The main blocks align perfectly. Here is a line-by-line review:\n- Preprocessor tags load standard headers.\n- Logic loops run efficiently in O(N).\n\nLet me know if you want to optimize any specific algorithms!`;
        } else if (body.mode === "theory") {
          responseText = `### Exam Theory Answer\nHere is a structured explanation of the topic:\n\n1. **Core Concept**: Standard design system layout.\n2. **Architecture**: Clean presentation model with proper division of layers.\n3. **Practical Examples**: Direct usage in mock databases.\n\nVerify these segments with your course notes!`;
        }

        // Return a mocked SSE (Server-Sent Events) or normal JSON response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            // Emulate chunks
            const dataStr = `data: ${JSON.stringify({ choices: [{ delta: { content: responseText } }] })}\n\ndata: [DONE]\n\n`;
            controller.enqueue(encoder.encode(dataStr));
            controller.close();
          }
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/event-stream" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to process request" }), { status: 500 });
      }
    }
    
    return originalFetch.apply(this, arguments as any);
  };
}

// Mock auth interface
const MOCK_USER: User = {
  id: "mock-user-123",
  aud: "authenticated",
  role: "authenticated",
  email: "ayushsinghrawat76456@gmail.com",
  email_confirmed_at: new Date().toISOString(),
  phone: "+91 98765 43210",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { full_name: "Ayush Singh" },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_SESSION: Session = {
  provider_token: "mock-token",
  provider_refresh_token: null,
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: MOCK_USER,
};

export const mockSupabase = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },
  auth: {
    async getSession() {
      return { data: { session: MOCK_SESSION }, error: null };
    },
    async signInWithPassword({ email }: { email: string }) {
      const user = { ...MOCK_USER, email };
      const session = { ...MOCK_SESSION, user };
      return { data: { user, session }, error: null };
    },
    async signUp({ email, password, options }: any) {
      const user = { ...MOCK_USER, email, user_metadata: options?.data || {} };
      const session = { ...MOCK_SESSION, user };
      return { data: { user, session }, error: null };
    },
    async signOut() {
      return { error: null };
    },
    onAuthStateChange(callback: any) {
      setTimeout(() => callback("SIGNED_IN", MOCK_SESSION), 0);
      return {
        data: {
          subscription: {
            unsubscribe() {}
          }
        }
      };
    }
  },
  storage: {
    from() {
      return {
        async upload(path: string, file: any) {
          return { data: { path }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200` } };
        }
      };
    }
  }
};
