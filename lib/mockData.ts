// Departments
export const DEPARTMENTS = [
    { id: 1, name: "Computer Science & Engineering", code: "CSE", hod: "Dr. Sarah Williams", totalStudents: 450, activeStudents: 420 },
    { id: 2, name: "Electrical & Electronics Engineering", code: "EEE", hod: "Dr. Michael Chen", totalStudents: 380, activeStudents: 365 },
    { id: 3, name: "Business Administration", code: "BBA", hod: "Dr. Emily Rodriguez", totalStudents: 520, activeStudents: 500 },
    { id: 4, name: "Civil Engineering", code: "CE", hod: "Dr. James Anderson", totalStudents: 340, activeStudents: 330 },
    { id: 5, name: "Mechanical Engineering", code: "ME", hod: "Dr. Robert Thompson", totalStudents: 390, activeStudents: 375 },
];

// Courses
export const COURSES = [
    { id: 1, name: "Data Structures & Algorithms", code: "CSE201", departmentId: 1, instructor: "Prof. John Smith", credits: 3 },
    { id: 2, name: "Database Management Systems", code: "CSE301", departmentId: 1, instructor: "Dr. Lisa Brown", credits: 3 },
    { id: 3, name: "Digital Electronics", code: "EEE101", departmentId: 2, instructor: "Dr. Ahmed Khan", credits: 4 },
    { id: 4, name: "Financial Accounting", code: "BBA102", departmentId: 3, instructor: "Prof. Maria Garcia", credits: 3 },
    { id: 5, name: "Structural Engineering", code: "CE301", departmentId: 4, instructor: "Dr. David Lee", credits: 4 },
    { id: 6, name: "Machine Learning", code: "CSE401", departmentId: 1, instructor: "Dr. Sarah Williams", credits: 3 },
    { id: 7, name: "Marketing Management", code: "BBA201", departmentId: 3, instructor: "Prof. Tom Harris", credits: 3 },
    { id: 8, name: "Thermodynamics", code: "ME201", departmentId: 5, instructor: "Dr. Kevin Park", credits: 3 },
];

// Enhanced Students with university fields
export const STUDENTS = [
    {
        id: 1,
        name: "Alexander Thompson",
        rollNo: "101",
        studentId: "CSE2021001",
        class: "3rd Year",
        department: "Computer Science & Engineering",
        departmentId: 1,
        semester: "6th Semester",
        email: "alexander.t@university.edu",
        phone: "+1 555-0101",
        address: "123 Campus Drive, Dorm A-201",
        courses: ["CSE201", "CSE301", "CSE401"]
    },
    {
        id: 2,
        name: "Isabella Martinez",
        rollNo: "102",
        studentId: "CSE2021002",
        class: "3rd Year",
        department: "Computer Science & Engineering",
        departmentId: 1,
        semester: "6th Semester",
        email: "isabella.m@university.edu",
        phone: "+1 555-0102",
        address: "456 University Ave, Dorm B-305",
        courses: ["CSE201", "CSE301"]
    },
    {
        id: 3,
        name: "Mohammed Rahman",
        rollNo: "103",
        studentId: "EEE2022001",
        class: "2nd Year",
        department: "Electrical & Electronics Engineering",
        departmentId: 2,
        semester: "4th Semester",
        email: "mohammed.r@university.edu",
        phone: "+1 555-0103",
        address: "789 College Street, Dorm C-102",
        courses: ["EEE101"]
    },
    {
        id: 4,
        name: "Sophia Chen",
        rollNo: "104",
        studentId: "BBA2021003",
        class: "3rd Year",
        department: "Business Administration",
        departmentId: 3,
        semester: "5th Semester",
        email: "sophia.c@university.edu",
        phone: "+1 555-0104",
        address: "321 Academic Blvd, Dorm A-410",
        courses: ["BBA102", "BBA201"]
    },
    {
        id: 5,
        name: "Ethan Williams",
        rollNo: "105",
        studentId: "CSE2021003",
        class: "3rd Year",
        department: "Computer Science & Engineering",
        departmentId: 1,
        semester: "6th Semester",
        email: "ethan.w@university.edu",
        phone: "+1 555-0105",
        address: "654 Scholar Lane, Dorm B-201",
        courses: ["CSE201", "CSE401"]
    },
    {
        id: 6,
        name: "Emma Johnson",
        rollNo: "106",
        studentId: "CE2022002",
        class: "2nd Year",
        department: "Civil Engineering",
        departmentId: 4,
        semester: "4th Semester",
        email: "emma.j@university.edu",
        phone: "+1 555-0106",
        address: "987 Education Way, Dorm C-305",
        courses: ["CE301"]
    },
    {
        id: 7,
        name: "Liam Anderson",
        rollNo: "107",
        studentId: "ME2021004",
        class: "3rd Year",
        department: "Mechanical Engineering",
        departmentId: 5,
        semester: "5th Semester",
        email: "liam.a@university.edu",
        phone: "+1 555-0107",
        address: "147 Knowledge Plaza, Dorm A-115",
        courses: ["ME201"]
    },
    {
        id: 8,
        name: "Olivia Taylor",
        rollNo: "108",
        studentId: "BBA2022003",
        class: "2nd Year",
        department: "Business Administration",
        departmentId: 3,
        semester: "4th Semester",
        email: "olivia.t@university.edu",
        phone: "+1 555-0108",
        address: "258 Learning Court, Dorm B-408",
        courses: ["BBA102"]
    },
    {
        id: 9,
        name: "Noah Davis",
        rollNo: "109",
        studentId: "CSE2022004",
        class: "2nd Year",
        department: "Computer Science & Engineering",
        departmentId: 1,
        semester: "3rd Semester",
        email: "noah.d@university.edu",
        phone: "+1 555-0109",
        address: "369 Study Street, Dorm C-210",
        courses: ["CSE201"]
    },
    {
        id: 10,
        name: "Ava Wilson",
        rollNo: "110",
        studentId: "EEE2021005",
        class: "3rd Year",
        department: "Electrical & Electronics Engineering",
        departmentId: 2,
        semester: "6th Semester",
        email: "ava.w@university.edu",
        phone: "+1 555-0110",
        address: "741 Wisdom Road, Dorm A-320",
        courses: ["EEE101"]
    },
];

export const ATTENDANCE_DATA = [
    { date: "2024-12-05", present: 210, absent: 15, late: 8 },
    { date: "2024-12-06", present: 218, absent: 10, late: 5 },
    { date: "2024-12-07", present: 215, absent: 12, late: 6 },
    { date: "2024-12-08", present: 205, absent: 20, late: 8 },
    { date: "2024-12-09", present: 225, absent: 5, late: 3 },
    { date: "2024-12-10", present: 220, absent: 8, late: 5 },
    { date: "2024-12-11", present: 223, absent: 7, late: 3 },
];

export const RECENT_ACTIVITY = [
    { id: 1, student: "Alexander Thompson", status: "Present", time: "08:00 AM", department: "CSE" },
    { id: 2, student: "Isabella Martinez", status: "Late", time: "08:15 AM", department: "CSE" },
    { id: 3, student: "Mohammed Rahman", status: "Present", time: "07:55 AM", department: "EEE" },
    { id: 4, student: "Sophia Chen", status: "Absent", time: "-", department: "BBA" },
    { id: 5, student: "Ethan Williams", status: "Present", time: "08:05 AM", department: "CSE" },
];
