import { httpClient } from '../core/http.js';
import { wrapProviderError } from '../core/errors.js';

const http = httpClient();
const BASE = 'https://jsonplaceholder.typicode.com';

export async function getPosts({ userId, id } = {}) {
  try {
    if (id) {
      const { data } = await http.get(`${BASE}/posts/${id}`);
      return data;
    }
    const params = {};
    if (userId) params.userId = userId;
    const { data } = await http.get(`${BASE}/posts`, { params });
    return { count: data.length, posts: data };
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}

export async function getComments({ postId }) {
  try {
    const { data } = await http.get(`${BASE}/comments`, { params: { postId } });
    return { count: data.length, comments: data };
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}

export async function getUser({ id }) {
  try {
    const { data } = await http.get(`${BASE}/users/${id}`);
    return data;
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}

export async function getUsers() {
  try {
    const { data } = await http.get(`${BASE}/users`);
    return { count: data.length, users: data };
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}

export async function getTodos({ userId, completed } = {}) {
  const params = {};
  if (userId !== undefined) params.userId = userId;
  if (completed !== undefined) params.completed = completed;
  try {
    const { data } = await http.get(`${BASE}/todos`, { params });
    return { count: data.length, todos: data };
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}

export async function getAlbums({ userId } = {}) {
  const params = {};
  if (userId) params.userId = userId;
  try {
    const { data } = await http.get(`${BASE}/albums`, { params });
    return { count: data.length, albums: data };
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}

export async function getPhotos({ albumId }) {
  try {
    const { data } = await http.get(`${BASE}/photos`, { params: { albumId } });
    return { count: data.length, photos: data.slice(0, 50) };
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}

export async function create({ resource = 'posts', body }) {
  try {
    const { data } = await http.post(`${BASE}/${resource}`, body);
    return { created: true, resource, record: data };
  } catch (err) {
    throw wrapProviderError(err, 'fakedb');
  }
}
