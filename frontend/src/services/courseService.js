import api from "./api";

// Get all courses with filters
export async function getCourses(params = {}) {
    const { data } = await api.get("/api/courses", { params });
    return data;
}

// Get course categories
export async function getCategories() {
    const { data } = await api.get("/api/courses/categories");
    return data;
}

// Get course stats
export async function getStats() {
    const { data } = await api.get("/api/courses/stats");
    return data;
}

// Get my courses (as instructor)
export async function getMyCourses() {
    const { data } = await api.get("/api/courses/my-courses");
    return data;
}

// Get my enrollments
export async function getMyEnrollments() {
    const { data } = await api.get("/api/courses/my-enrollments");
    return data;
}

// Get instructor earnings
export async function getEarnings() {
    const { data } = await api.get("/api/courses/instructor/earnings");
    return data;
}

// Get single course
export async function getCourse(id) {
    const { data } = await api.get(`/api/courses/${id}`);
    return data;
}

// Create course
export async function createCourse(courseData) {
    const { data } = await api.post("/api/courses", courseData);
    return data;
}

// Update course
export async function updateCourse(id, courseData) {
    const { data } = await api.patch(`/api/courses/${id}`, courseData);
    return data;
}

// Delete course
export async function deleteCourse(id) {
    const { data } = await api.delete(`/api/courses/${id}`);
    return data;
}

// Enroll in course
export async function enrollCourse(courseId, paymentType = "oneTime") {
    const { data } = await api.post(`/api/courses/${courseId}/enroll`, { paymentType });
    return data;
}

// Get my progress
export async function getMyProgress(courseId) {
    const { data } = await api.get(`/api/courses/${courseId}/progress`);
    return data;
}

// Complete lesson - sends lessonIndex to backend
// Note: The backend expects lessonIndex (number), not lessonId
export async function completeLesson(courseId, lessonIndex) {
    const { data } = await api.post(`/api/courses/${courseId}/progress/complete`, { lessonId: lessonIndex });
    return data;
}

// Submit assignment
export async function submitAssignment(courseId, assignmentData) {
    const { data } = await api.post(`/api/courses/${courseId}/assignments`, assignmentData);
    return data;
}

// Get student submissions (instructor)
export async function getStudentSubmissions(courseId) {
    const { data } = await api.get(`/api/courses/${courseId}/submissions`);
    return data;
}

// Grade assignment (instructor)
export async function gradeAssignment(courseId, enrollmentId, gradeData) {
    const { data } = await api.patch(`/api/courses/${courseId}/enrollments/${enrollmentId}/grade`, gradeData);
    return data;
}

// Get my level/progress
export async function getMyLevel() {
    const { data } = await api.get("/api/courses/my-level");
    return data;
}
