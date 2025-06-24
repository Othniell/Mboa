// src/api/auth.js
export const login = async ({ email, password }) => {
  // fake wait 1s
  await new Promise((r) => setTimeout(r, 1000));

  if (email === 'user@example.com' && password === 'password') {
    return {
      token: 'fake-token',
      user: { id: 1, name: 'John Doe', email },
    };
  } else {
    throw { response: { data: { message: 'Invalid email or password' } } };
  }
};
