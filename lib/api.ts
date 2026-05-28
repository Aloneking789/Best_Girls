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
  image?: string;
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
  image?: File;
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

// Update course - ALWAYS uses multipart/form-data (image is REQUIRED)
export const updateCourse = async (
  id: string,
  payload: CourseUpdatePayload
): Promise<Course> => {
  try {
    // Convert JSON payload to FormData
    const formData = new FormData();
    
    // Add all fields to form data (excluding categoryId - don't pass it on update)
    if (payload.title) formData.append('title', payload.title);
    if (payload.slug) formData.append('slug', payload.slug);
    if (payload.description) formData.append('description', payload.description);
    if (payload.duration) formData.append('duration', payload.duration);
    if (payload.fee) formData.append('fee', payload.fee);
    if (payload.eligibility) formData.append('eligibility', payload.eligibility);
    // NOTE: categoryId is NOT included in FormData for updates - backend doesn't accept it
    if (payload.isActive !== undefined) formData.append('isActive', String(payload.isActive));
    // NOTE: image is REQUIRED for updates - backend always expects it
    if (payload.image) formData.append('image', payload.image);
    else {
      throw new Error('Image is required for course updates. Please provide an image file.');
    }

    console.log('Updating course with FormData:', { id, hasImage: !!payload.image, fields: Object.keys(payload) });
    
    const token = getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // DO NOT set Content-Type - let browser handle it with boundary

    const response = await fetch(`${API_BASE_URL}/cr/courses/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
      console.error('Server response:', { status: response.status, error: errorData });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Course updated successfully:', data.data);
    return data.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating course:', message);
    throw new Error(`Failed to update course: ${message}`);
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

// Upload course image (now uses multipart form-data via updateCourse)
export const uploadCourseImage = async (id: string, image: File): Promise<Course> => {
  try {
    return await updateCourse(id, { image });
  } catch (error) {
    console.error('Error uploading course image:', error);
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

// ==================== BLOG/POST ENDPOINTS ====================

export interface PostCategory {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: PostCategory;
  tags: string[];
}

export interface PostCreatePayload {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  categoryId: string;
  coverImage?: File;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface PostUpdatePayload {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  coverImage?: File;
  isPublished?: boolean;
  publishedAt?: string;
}

// Get all post categories
export const getPostCategories = async (): Promise<PostCategory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ps/categories`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post categories');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching post categories:', error);
    throw error;
  }
};

// Create post category
export const createPostCategory = async (payload: { name: string }): Promise<PostCategory> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ps/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create post category');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating post category:', error);
    throw error;
  }
};

// Get all posts
export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ps/posts/`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Create post with image upload
export const createPost = async (payload: PostCreatePayload): Promise<Post> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('slug', payload.slug || payload.title.toLowerCase().replace(/\s+/g, '-'));
    formData.append('excerpt', payload.excerpt);
    formData.append('content', payload.content);
    formData.append('metaTitle', payload.metaTitle);
    formData.append('metaDescription', payload.metaDescription);
    formData.append('categoryId', payload.categoryId);
    formData.append('isPublished', payload.isPublished ? 'true' : 'false');
    if (payload.publishedAt) formData.append('publishedAt', payload.publishedAt);
    if (payload.coverImage) formData.append('coverImage', payload.coverImage);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ps/posts`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update post
export const updatePost = async (id: string, payload: PostUpdatePayload): Promise<Post> => {
  try {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.slug) formData.append('slug', payload.slug);
    if (payload.excerpt) formData.append('excerpt', payload.excerpt);
    if (payload.content) formData.append('content', payload.content);
    if (payload.metaTitle) formData.append('metaTitle', payload.metaTitle);
    if (payload.metaDescription) formData.append('metaDescription', payload.metaDescription);
    if (payload.categoryId) formData.append('categoryId', payload.categoryId);
    if (payload.isPublished !== undefined) formData.append('isPublished', payload.isPublished ? 'true' : 'false');
    if (payload.publishedAt) formData.append('publishedAt', payload.publishedAt);
    if (payload.coverImage) formData.append('coverImage', payload.coverImage);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ps/posts/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update post');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete post
export const deletePost = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ps/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// ==================== DEPARTMENT ENDPOINTS ====================

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreatePayload {
  name: string;
  slug?: string;
  description: string;
  isActive?: boolean;
}

export interface DepartmentUpdatePayload {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/departments`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Create department
export const createDepartment = async (payload: DepartmentCreatePayload): Promise<Department> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/departments`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        ...payload,
        slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-'),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create department');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

// Update department
export const updateDepartment = async (
  id: string,
  payload: DepartmentUpdatePayload
): Promise<Department> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/departments/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update department');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

// Delete department
export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cr/departments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete department');
    }
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

// ==================== FACULTY ENDPOINTS ====================

export interface Faculty {
  id: string;
  name: string;
  email: string | null;
  designation: string | null;
  qualification: string;
  experience: string;
  bio: string;
  photoUrl: string;
  staffType: string;
  departmentId: string;
  order: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface FacultyCreatePayload {
  name: string;
  email?: string;
  designation?: string;
  qualification: string;
  experience: string;
  bio: string;
  photo?: File;
  staffType: string;
  departmentId: string;
}

export interface FacultyUpdatePayload {
  name?: string;
  email?: string;
  designation?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  photo?: File;
  staffType?: string;
  departmentId?: string;
}

// Get all faculty
export const getFaculty = async (): Promise<Faculty[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fr/faculty`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch faculty');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching faculty:', error);
    throw error;
  }
};

// Create faculty with photo upload
export const createFaculty = async (payload: FacultyCreatePayload): Promise<Faculty> => {
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.email) formData.append('email', payload.email);
    if (payload.designation) formData.append('designation', payload.designation);
    formData.append('qualification', payload.qualification);
    formData.append('experience', payload.experience);
    formData.append('bio', payload.bio);
    formData.append('staffType', payload.staffType);
    formData.append('departmentId', payload.departmentId);
    if (payload.photo) formData.append('photo', payload.photo);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/fr/faculty/`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create faculty');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating faculty:', error);
    throw error;
  }
};

// Update faculty
export const updateFaculty = async (id: string, payload: FacultyUpdatePayload): Promise<Faculty> => {
  try {
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.email) formData.append('email', payload.email);
    if (payload.designation) formData.append('designation', payload.designation);
    if (payload.qualification) formData.append('qualification', payload.qualification);
    if (payload.experience) formData.append('experience', payload.experience);
    if (payload.bio) formData.append('bio', payload.bio);
    if (payload.staffType) formData.append('staffType', payload.staffType);
    if (payload.departmentId) formData.append('departmentId', payload.departmentId);
    if (payload.photo) formData.append('photo', payload.photo);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/fr/faculty/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update faculty');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating faculty:', error);
    throw error;
  }
};

// Delete faculty
export const deleteFaculty = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fr/faculty/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete faculty');
    }
  } catch (error) {
    console.error('Error deleting faculty:', error);
    throw error;
  }
};

// Toggle faculty featured status
export const toggleFeatureFaculty = async (id: string): Promise<Faculty> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fr/faculty/${id}/feature`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle featured status');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error toggling featured status:', error);
    throw error;
  }
};

// ==================== EVENT ENDPOINTS ====================

export interface Event {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  category: string;
  coverImage: string;
  startAt: string;
  endAt: string;
  venue: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreatePayload {
  title: string;
  slug?: string;
  excerpt: string;
  description: string;
  category: string;
  startAt: string;
  endAt: string;
  venue: string;
  coverImage?: File;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface EventUpdatePayload {
  title?: string;
  slug?: string;
  excerpt?: string;
  description?: string;
  category?: string;
  startAt?: string;
  endAt?: string;
  venue?: string;
  coverImage?: File;
  isFeatured?: boolean;
  isActive?: boolean;
}

// Get all events
export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/er/events`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Create event with image upload
export const createEvent = async (payload: EventCreatePayload): Promise<Event> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('slug', payload.slug || payload.title.toLowerCase().replace(/\s+/g, '-'));
    formData.append('excerpt', payload.excerpt);
    formData.append('description', payload.description);
    formData.append('category', payload.category);
    formData.append('startAt', payload.startAt);
    formData.append('endAt', payload.endAt);
    formData.append('venue', payload.venue);
    formData.append('isFeatured', payload.isFeatured ? 'true' : 'false');
    formData.append('isActive', payload.isActive ? 'true' : 'false');
    if (payload.coverImage) formData.append('coverImage', payload.coverImage);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/er/events/`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (id: string, payload: EventUpdatePayload): Promise<Event> => {
  try {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.slug) formData.append('slug', payload.slug);
    if (payload.excerpt) formData.append('excerpt', payload.excerpt);
    if (payload.description) formData.append('description', payload.description);
    if (payload.category) formData.append('category', payload.category);
    if (payload.startAt) formData.append('startAt', payload.startAt);
    if (payload.endAt) formData.append('endAt', payload.endAt);
    if (payload.venue) formData.append('venue', payload.venue);
    if (payload.isFeatured !== undefined) formData.append('isFeatured', payload.isFeatured ? 'true' : 'false');
    if (payload.isActive !== undefined) formData.append('isActive', payload.isActive ? 'true' : 'false');
    if (payload.coverImage) formData.append('coverImage', payload.coverImage);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/er/events/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update event');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/er/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// ==================== ACHIEVEMENT ENDPOINTS ====================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  year: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementCreatePayload {
  title: string;
  description: string;
  category: string;
  year: number;
  imageUrl?: string;
  image?: File;
  isActive?: boolean;
}

export interface AchievementUpdatePayload {
  title?: string;
  description?: string;
  category?: string;
  year?: number;
  imageUrl?: string;
  image?: File;
  isActive?: boolean;
}

// Get all achievements
export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ar/achievements`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

// Create achievement with image upload
export const createAchievement = async (payload: AchievementCreatePayload): Promise<Achievement> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('category', payload.category);
    formData.append('year', payload.year.toString());
    formData.append('imageUrl', payload.imageUrl || 'NA');
    formData.append('isActive', payload.isActive ? 'true' : 'false');
    if (payload.image) formData.append('image', payload.image);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ar/achievements`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create achievement');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating achievement:', error);
    throw error;
  }
};

// Update achievement
export const updateAchievement = async (id: string, payload: AchievementUpdatePayload): Promise<Achievement> => {
  try {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.description) formData.append('description', payload.description);
    if (payload.category) formData.append('category', payload.category);
    if (payload.year) formData.append('year', payload.year.toString());
    formData.append('imageUrl', payload.imageUrl || 'NA');
    if (payload.isActive !== undefined) formData.append('isActive', payload.isActive ? 'true' : 'false');
    if (payload.image) formData.append('image', payload.image);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ar/achievements/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update achievement');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating achievement:', error);
    throw error;
  }
};

// Delete achievement
export const deleteAchievement = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ar/achievements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete achievement');
    }
  } catch (error) {
    console.error('Error deleting achievement:', error);
    throw error;
  }
};

// ==================== NOTICE ENDPOINTS ====================

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  publishedAt: string;
  expiresAt: string;
  isArchived: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeCreatePayload {
  title: string;
  content: string;
  type: string;
  publishedAt: string;
  expiresAt: string;
  isArchived?: boolean;
  isActive?: boolean;
}

export interface NoticeUpdatePayload {
  title?: string;
  content?: string;
  type?: string;
  publishedAt?: string;
  expiresAt?: string;
  isArchived?: boolean;
  isActive?: boolean;
}

// Get all notices
export const getNotices = async (): Promise<Notice[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nr/notices`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notices');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching notices:', error);
    throw error;
  }
};

// Create notice
export const createNotice = async (payload: NoticeCreatePayload): Promise<Notice> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nr/notices`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create notice');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating notice:', error);
    throw error;
  }
};

// Update notice
export const updateNotice = async (id: string, payload: NoticeUpdatePayload): Promise<Notice> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nr/notices/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update notice');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating notice:', error);
    throw error;
  }
};

// Archive/unarchive notice
export const toggleArchiveNotice = async (id: string): Promise<Notice> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nr/notices/${id}/archive`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle archive status');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error toggling archive status:', error);
    throw error;
  }
};

// Delete notice
export const deleteNotice = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/nr/notices/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete notice');
    }
  } catch (error) {
    console.error('Error deleting notice:', error);
    throw error;
  }
};

// ==================== PLACEMENT ENDPOINTS ====================

export interface Placement {
  id: string;
  companyName: string;
  studentName: string;
  year: number;
  testimonial: string;
  companyLogo: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlacementCreatePayload {
  companyName: string;
  studentName: string;
  year: number;
  testimonial: string;
  companyLogo?: File | string;
  order?: number;
  isActive?: boolean;
}

export interface PlacementUpdatePayload {
  companyName?: string;
  studentName?: string;
  year?: number;
  testimonial?: string;
  companyLogo?: File | string;
  order?: number;
  isActive?: boolean;
}

// Get all placements
export const getPlacements = async (): Promise<Placement[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pr/placements/`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch placements');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching placements:', error);
    throw error;
  }
};

// Create placement with logo upload
export const createPlacement = async (payload: PlacementCreatePayload): Promise<Placement> => {
  try {
    const formData = new FormData();
    formData.append('companyName', payload.companyName);
    formData.append('studentName', payload.studentName);
    formData.append('year', payload.year.toString());
    formData.append('testimonial', payload.testimonial);
    formData.append('isActive', payload.isActive ? 'true' : 'false');
    if (payload.order !== undefined) {
      formData.append('order', payload.order.toString());
    }
    if (payload.companyLogo) {
      if (typeof payload.companyLogo === 'string') {
        formData.append('companyLogo', payload.companyLogo);
      } else {
        formData.append('companyLogo', payload.companyLogo);
      }
    }

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/pr/placements/`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create placement');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating placement:', error);
    throw error;
  }
};

// Update placement
export const updatePlacement = async (id: string, payload: PlacementUpdatePayload): Promise<Placement> => {
  try {
    const formData = new FormData();
    if (payload.companyName) formData.append('companyName', payload.companyName);
    if (payload.studentName) formData.append('studentName', payload.studentName);
    if (payload.year !== undefined) formData.append('year', payload.year.toString());
    if (payload.testimonial) formData.append('testimonial', payload.testimonial);
    if (payload.isActive !== undefined) formData.append('isActive', payload.isActive ? 'true' : 'false');
    if (payload.order !== undefined) formData.append('order', payload.order.toString());
    if (payload.companyLogo) {
      if (typeof payload.companyLogo === 'string') {
        formData.append('companyLogo', payload.companyLogo);
      } else {
        formData.append('companyLogo', payload.companyLogo);
      }
    }

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/pr/placements/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update placement');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating placement:', error);
    throw error;
  }
};

// Delete placement
export const deletePlacement = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pr/placements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete placement');
    }
  } catch (error) {
    console.error('Error deleting placement:', error);
    throw error;
  }
};

// ==================== INQUIRY ENDPOINTS ====================

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseInterest: string;
  message: string;
  documentUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryCreatePayload {
  name: string;
  email: string;
  phone: string;
  courseInterest: string;
  message: string;
  documentUrl?: string;
}

export interface InquiryUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  courseInterest?: string;
  message?: string;
  documentUrl?: string;
  status?: string;
}

// Get all inquiries
export const getInquiries = async (): Promise<Inquiry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ir/inquiries`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch inquiries');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
};

// Create inquiry
export const createInquiry = async (payload: InquiryCreatePayload): Promise<Inquiry> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ir/inquiries`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create inquiry');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

// Update inquiry status
export const updateInquiry = async (id: string, payload: InquiryUpdatePayload): Promise<Inquiry> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ir/inquiries/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update inquiry');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
};

// Delete inquiry
export const deleteInquiry = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ir/inquiries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete inquiry');
    }
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    throw error;
  }
};

// ==================== SETTINGS ENDPOINTS ====================

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface Settings {
  id: string;
  websiteName: string;
  websiteMeta: string;
  metaKeywords: string;
  metaDescription: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  addressLink: string;
  socialLinks: SocialLinks;
  headerScript: string;
  footerScript: string;
  mapEmbed: string;
  logo: string;
  whiteLogo: string;
  favicon: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsUpdatePayload {
  websiteName?: string;
  websiteMeta?: string;
  metaKeywords?: string;
  metaDescription?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
  addressLink?: string;
  socialLinks?: SocialLinks;
  headerScript?: string;
  footerScript?: string;
  mapEmbed?: string;
  logo?: string;
  whiteLogo?: string;
  favicon?: string;
}

// Get settings
export const getSettings = async (): Promise<Settings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sr/settings`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Update settings
export const updateSettings = async (payload: SettingsUpdatePayload): Promise<Settings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sr/settings/`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update settings');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// ==================== USER MANAGEMENT ENDPOINTS ====================

export interface UserRole {
  id: string;
  name: string;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  roleId: string;
  role: UserRole;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  roleId: string;
  image?: File;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  image?: File;
}

export interface Role {
  id: string;
  name: string;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export interface RoleCreatePayload {
  name: string;
}

export interface RoleUpdatePayload {
  name?: string;
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/um/users`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create user with image upload
export const createUser = async (payload: UserCreatePayload): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('roleId', payload.roleId);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/um/users`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (id: string, payload: UserUpdatePayload): Promise<User> => {
  try {
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.email) formData.append('email', payload.email);
    if (payload.password) formData.append('password', payload.password);
    if (payload.roleId) formData.append('roleId', payload.roleId);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/um/users/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/um/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ==================== ROLE MANAGEMENT ENDPOINTS ====================

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/um/roles`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Create role
export const createRole = async (payload: RoleCreatePayload): Promise<Role> => {
  try {
    const response = await fetch(`${API_BASE_URL}/um/users/roles`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create role');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

// Update role
export const updateRole = async (id: string, payload: RoleUpdatePayload): Promise<Role> => {
  try {
    const response = await fetch(`${API_BASE_URL}/um/roles/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update role');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

// Delete role
export const deleteRole = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/um/roles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete role');
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

// ==================== DASHBOARD ENDPOINTS ====================

export interface DashboardMetrics {
  leadCount: number;
  inquiryCount: number;
  placementCount: number;
  noticeCount: number;
  resourceCount: number;
  userCount: number;
  eventCount: number;
  facultyCount: number;
}

// Get dashboard metrics
export const getDashboard = async (): Promise<DashboardMetrics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dash/dashboard`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};
