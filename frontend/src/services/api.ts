/**
 * SkillVerse API Client Service
 */

const API_BASE = '/api/v1';

// Get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('skillverse_token');
};

// Set token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem('skillverse_token', token);
};

// Get current user role
export const getSavedUser = (): any | null => {
  const userStr = localStorage.getItem('skillverse_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Set user in localStorage
export const setSavedUser = (user: any) => {
  localStorage.setItem('skillverse_user', JSON.stringify(user));
};

// Clear authentication state
export const clearAuth = () => {
  localStorage.removeItem('skillverse_token');
  localStorage.removeItem('skillverse_user');
};

// Fetch wrapper with auth injection
async function fetchClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  // Only set Content-Type to application/json if not uploading files (FormData)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export const api = {
  // Authentication
  auth: {
    register: (phoneNumber: string, password: string, name: string) =>
      fetchClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password, name }),
      }),
    login: (phoneNumber: string, password: string) =>
      fetchClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
      }),
    requestOtp: (phoneNumber: string) =>
      fetchClient('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      }),
    verifyOtp: (phoneNumber: string, code: string) =>
      fetchClient('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, code }),
      }),
    updateRole: (role: 'worker' | 'employer') =>
      fetchClient('/auth/role', {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
  },

  // Workers
  workers: {
    getProfile: () => fetchClient('/workers/me'),
    updateProfile: (profileData: {
      fullName?: string;
      gender?: string;
      location?: { type: 'Point'; coordinates: [number, number] };
      tradeCategory?: string;
      languages?: string[];
    }) =>
      fetchClient('/workers/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
    getPassport: (workerId: string) => fetchClient(`/workers/passport/${workerId}`),
    getNearby: (params: { lat: number; lng: number; radiusKm?: number; category?: string }) => {
      const query = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
      });
      if (params.radiusKm !== undefined) query.append('radiusKm', params.radiusKm.toString());
      if (params.category) query.append('category', params.category);
      return fetchClient(`/workers/nearby?${query.toString()}`);
    },
  },

  // Jobs
  jobs: {
    createJob: (jobData: {
      title: string;
      description: string;
      tradeCategory: string;
      address: string;
      location: { type: 'Point'; coordinates: [number, number] };
      salaryRange?: string;
      jobType?: 'full-time' | 'gig' | 'contract';
      requiredSkills?: string[];
    }) =>
      fetchClient('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      }),
    getEmployerJobs: () => fetchClient('/jobs/employer'),
    getApplicants: (jobId: string) => fetchClient(`/jobs/${jobId}/applicants`),
    updateApplicationStatus: (
      applicationId: string,
      status: 'applied' | 'shortlisted' | 'hired' | 'rejected'
    ) =>
      fetchClient(`/jobs/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getNearby: (params: {
      lat: number;
      lng: number;
      radiusKm?: number;
      category?: string;
    }) => {
      const query = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
        radiusKm: (params.radiusKm !== undefined ? params.radiusKm : 10).toString(),
      });
      if (params.category) {
        query.append('category', params.category);
      }
      return fetchClient(`/jobs/nearby?${query.toString()}`);
    },
    apply: (jobId: string, voicePitchBlob?: Blob) => {
      const formData = new FormData();
      if (voicePitchBlob) {
        formData.append('voicePitch', voicePitchBlob, 'pitch.webm');
      }
      return fetchClient(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: formData,
      });
    },
    getWorkerApplications: () => fetchClient('/jobs/worker/applications'),
  },

  // Voice Assessment
  assessment: {
    getQuestions: (tradeCategory: string, language: string) => {
      const query = new URLSearchParams({ tradeCategory, language });
      return fetchClient(`/assessments/questions?${query.toString()}`);
    },
    submit: (
      tradeCategory: string,
      language: string,
      answers: { questionId: string; questionText: string; blob: Blob }[]
    ) => {
      const formData = new FormData();
      formData.append('tradeCategory', tradeCategory);
      formData.append('language', language);
      
      answers.forEach((ans) => {
        formData.append('questionIds', ans.questionId);
        formData.append('questionTexts', ans.questionText);
        formData.append('audioAnswers', ans.blob, `answer-${ans.questionId}.webm`);
      });

      return fetchClient('/assessments/submit', {
        method: 'POST',
        body: formData,
      });
    },
    getStatus: (assessmentId: string) => fetchClient(`/assessments/${assessmentId}`),
  },
};
