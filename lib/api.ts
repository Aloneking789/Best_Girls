// Centralized API configuration with authorization token handling
const API_BASE_URL = 'https://kgvit.vercel.app/api/v1';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    email: string;
    roleId: string;
    role: {
      id: string;
      name: string;
      permissions: Array<{
        id: string;
        roleId: string;
        permissionId: string;
        permission: {
          id: string;
          name: string;
          description: string;
        };
      }>;
    };
  };
}

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kvgittoken');
};

// Get headers with authorization token
export const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Login API call
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/main/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

// Generic fetch wrapper with automatic token inclusion
export const apiCall = async <T,>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders(true);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

// Save auth data to localStorage
export const saveAuthData = (data: LoginResponse): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kvgittoken', data.token);
  localStorage.setItem(
    'kvgituser',
    JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role.name,
      permissions: data.user.role.permissions.map((p) => p.permission.name),
    })
  );

  // Also store token in cookie for middleware
  document.cookie = `kvgittoken=${data.token}; path=/; max-age=604800; SameSite=Lax`;
};

// Clear auth data from localStorage
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kvgittoken');
  localStorage.removeItem('kvgituser');
};

// Get user data from localStorage
export const getUserData = (): any => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('kvgituser');
  return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('kvgittoken');
};

// ==================== SLIDER ENDPOINTS ====================

export interface Slider {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SliderCreatePayload {
  title: string;
  caption: string;
  linkUrl: string;
  image?: File;
}

export interface SliderUpdatePayload {
  title?: string;
  caption?: string;
  linkUrl?: string;
  order?: number;
  image?: File;
}

// Get all sliders
export const getSliders = async (): Promise<Slider[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sf/sliders`, {
      method: 'GET',
      headers: getHeaders(false),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sliders');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching sliders:', error);
    throw error;
  }
};

// Create slider with image upload
export const createSlider = async (payload: SliderCreatePayload): Promise<Slider> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('caption', payload.caption);
    formData.append('linkUrl', payload.linkUrl);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const token = getToken();
    const headers: any = {
      'Authorization': token ? `Bearer ${token}` : '',
    };

    const response = await fetch(`${API_BASE_URL}/sf/sliders`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create slider');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating slider:', error);
    throw error;
  }
};

// Update slider
export const updateSlider = async (
  id: string,
  payload: SliderUpdatePayload
): Promise<Slider> => {
  try {
    let body: any;
    let headers: any = getHeaders(true);

    if (payload.image) {
      // Use FormData for multipart request
      const formData = new FormData();
      if (payload.title) formData.append('title', payload.title);
      if (payload.caption) formData.append('caption', payload.caption);
      if (payload.linkUrl) formData.append('linkUrl', payload.linkUrl);
      if (payload.order !== undefined) formData.append('order', payload.order.toString());
      formData.append('image', payload.image);

      const token = getToken();
      headers = {
        'Authorization': token ? `Bearer ${token}` : '',
      };
      body = formData;
    } else {
      // Use JSON for non-image updates
      body = JSON.stringify(payload);
    }

    const response = await fetch(`${API_BASE_URL}/sf/sliders/${id}`, {
      method: 'PUT',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to update slider');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating slider:', error);
    throw error;
  }
};

// Delete slider
export const deleteSlider = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sf/sliders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete slider');
    }
  } catch (error) {
    console.error('Error deleting slider:', error);
    throw error;
  }
};

// Toggle slider active status
export const toggleSlider = async (id: string): Promise<Slider> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sf/sliders/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle slider');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error toggling slider:', error);
    throw error;
  }
};

// ==================== COURSE ENDPOINTS ====================

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order: number;
  createdAt: string;
  parent: CourseCategory | null;
  children: CourseCategory[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  fee: string;
  eligibility: string;
  attachments: string;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CourseCreatePayload {
  title: string;
  slug?: string;
  description: string;
  duration: string;
  fee: string;
  eligibility: string;
  attachments?: string;
  categoryId: string;
  isActive?: boolean;
}

export interface CourseUpdatePayload {
  title?: string;
  slug?: string;
  description?: string;
  duration?: string;
  fee?: string;
  eligibility?: string;
  attachments?: string;
  categoryId?: string;
  isActive?: boolean;
}

// Get all course categories
export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/course-categories`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course categories');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching course categories:', error);
    throw error;
  }
};

// Create course category
export const createCourseCategory = async (payload: {
  name: string;
  slug: string;
}): Promise<CourseCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/course-categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create course category');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating course category:', error);
    throw error;
  }
};

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/courses`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Create course
export const createCourse = async (payload: CourseCreatePayload): Promise<Course> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/courses`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        ...payload,
        slug: payload.slug || payload.title.toLowerCase().replace(/\s+/g, '-'),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update course
export const updateCourse = async (
  id: string,
  payload: CourseUpdatePayload
): Promise<Course> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update course');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Toggle course active status
export const toggleCourse = async (id: string): Promise<Course> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/courses/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle course');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error toggling course:', error);
    throw error;
  }
};

// ==================== FACILITIES ENDPOINTS ====================

export interface Facility {
  id: string;
  title: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityCreatePayload {
  title: string;
  image?: File;
  sortOrder?: number;
}

export interface FacilityUpdatePayload {
  title?: string;
  image?: File;
  sortOrder?: number;
  isActive?: boolean;
}

// Get all facilities
export const getFacilities = async (): Promise<Facility[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sf/facilities`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch facilities');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching facilities:', error);
    throw error;
  }
};

// Create facility with image upload
export const createFacility = async (payload: FacilityCreatePayload): Promise<Facility> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.sortOrder !== undefined) {
      formData.append('sortOrder', payload.sortOrder.toString());
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const token = getToken();
    const headers: any = {
      'Authorization': token ? `Bearer ${token}` : '',
    };

    const response = await fetch(`${API_BASE_URL}/sf/facilities`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create facility');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating facility:', error);
    throw error;
  }
};

// Update facility
export const updateFacility = async (
  id: string,
  payload: FacilityUpdatePayload
): Promise<Facility> => {
  try {
    let body: any;
    let headers: any = getHeaders(true);

    if (payload.image) {
      // Use FormData for multipart request
      const formData = new FormData();
      if (payload.title) formData.append('title', payload.title);
      if (payload.sortOrder !== undefined) formData.append('sortOrder', payload.sortOrder.toString());
      if (payload.isActive !== undefined) formData.append('isActive', payload.isActive.toString());
      formData.append('image', payload.image);

      const token = getToken();
      headers = {
        'Authorization': token ? `Bearer ${token}` : '',
      };
      body = formData;
    } else {
      // Use JSON for non-image updates
      body = JSON.stringify(payload);
    }

    const response = await fetch(`${API_BASE_URL}/sf/facilities/${id}`, {
      method: 'PUT',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to update facility');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating facility:', error);
    throw error;
  }
};

// Delete facility
export const deleteFacility = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sf/facilities/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete facility');
    }
  } catch (error) {
    console.error('Error deleting facility:', error);
    throw error;
  }
};

// Toggle facility active status
export const toggleFacility = async (id: string): Promise<Facility> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sf/facilities/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle facility');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error toggling facility:', error);
    throw error;
  }
};
