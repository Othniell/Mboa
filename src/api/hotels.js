const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/hotels`; // your backend endpoint

export const fetchHotels = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch hotels');
  return res.json();
};

export const fetchHotelById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch hotel details');
  return res.json();
};
