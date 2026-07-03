import axios from 'axios';

export async function getRandomUser({ gender, nationality } = {}) {
  const params = {};
  if (gender) params.gender = gender;
  if (nationality) params.nat = nationality;
  const { data } = await axios.get('https://randomuser.me/api/', { params });
  const u = data.results?.[0];
  if (!u) return { found: false };
  return {
    found: true,
    name: `${u.name.first} ${u.name.last}`,
    gender: u.gender,
    email: u.email,
    username: u.login?.username,
    phone: u.phone,
    location: `${u.location.city}, ${u.location.country}`,
    nationality: u.nat,
    picture: u.picture?.large,
    dob: u.dob?.date,
  };
}

export async function getRandomUsers({ count = 5, gender, nationality } = {}) {
  const params = { results: Math.min(count, 50) };
  if (gender) params.gender = gender;
  if (nationality) params.nat = nationality;
  const { data } = await axios.get('https://randomuser.me/api/', { params });
  return {
    count: data.results?.length || 0,
    users: (data.results || []).map((u) => ({
      name: `${u.name.first} ${u.name.last}`,
      gender: u.gender,
      email: u.email,
      location: `${u.location.city}, ${u.location.country}`,
      picture: u.picture?.thumbnail,
    })),
  };
}
