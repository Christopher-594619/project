export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock authentication
        if (email === 'student@test.com' && password === 'password') {
          resolve({
            id: 1,
            name: 'Student User',
            email: 'student@test.com',
            type: 'student',
            avatar: 'SU',
          });
        } else if (email === 'tutor@test.com' && password === 'password') {
          resolve({
            id: 2,
            name: 'Tutor User',
            email: 'tutor@test.com',
            type: 'tutor',
            avatar: 'TU',
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  },

  register: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          ...userData,
          avatar: userData.name.split(' ').map(n => n[0]).join(''),
          createdAt: new Date().toISOString(),
        });
      }, 500);
    });
  },

  forgotPassword: async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Password reset link sent to your email' });
      }, 500);
    });
  },
};