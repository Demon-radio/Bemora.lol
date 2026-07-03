import axios from 'axios';

const BASE = 'https://jsonplaceholder.typicode.com';

/**
 * Get posts from the sample database (all, or filtered by user)
 * @param {{ userId?: number, id?: number }} params
 */
export async function getPosts({ userId, id } = {}) {
  if (id) {
    const { data } = await axios.get(`${BASE}/posts/${id}`);
    return data;
  }
  const params = {};
  if (userId) params.userId = userId;
  const { data } = await axios.get(`${BASE}/posts`, { params });
  return { count: data.length, posts: data };
}

/**
 * Get comments for a post
 * @param {{ postId: number }} params
 */
export async function getComments({ postId }) {
  const { data } = await axios.get(`${BASE}/comments`, { params: { postId } });
  return { count: data.length, comments: data };
}

/**
 * Get a user's profile from the sample database
 * @param {{ id: number }} params
 */
export async function getUser({ id }) {
  const { data } = await axios.get(`${BASE}/users/${id}`);
  return data;
}

/**
 * List all users in the sample database
 */
export async function getUsers() {
  const { data } = await axios.get(`${BASE}/users`);
  return { count: data.length, users: data };
}

/**
 * Get todos, optionally filtered by user and completion status
 * @param {{ userId?: number, completed?: boolean }} params
 */
export async function getTodos({ userId, completed } = {}) {
  const params = {};
  if (userId !== undefined) params.userId = userId;
  if (completed !== undefined) params.completed = completed;
  const { data } = await axios.get(`${BASE}/todos`, { params });
  return { count: data.length, todos: data };
}

/**
 * Get photo albums, optionally filtered by user
 * @param {{ userId?: number }} params
 */
export async function getAlbums({ userId } = {}) {
  const params = {};
  if (userId) params.userId = userId;
  const { data } = await axios.get(`${BASE}/albums`, { params });
  return { count: data.length, albums: data };
}

/**
 * Get photos in an album
 * @param {{ albumId: number }} params
 */
export async function getPhotos({ albumId }) {
  const { data } = await axios.get(`${BASE}/photos`, { params: { albumId } });
  return { count: data.length, photos: data.slice(0, 50) };
}

/**
 * Simulate creating a record (POST) in the sample database — echoes back a fake created ID
 * @param {{ resource: 'posts'|'comments'|'albums'|'todos'|'users', body: object }} params
 */
export async function create({ resource = 'posts', body }) {
  const { data } = await axios.post(`${BASE}/${resource}`, body);
  return { created: true, resource, record: data };
}
