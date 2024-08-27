'use client';
    
import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { useRouter } from 'next/navigation'; 
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { useUserData } from './context';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter(); 
  const { setUserData } = useUserData();


 
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userRef = ref(database, 'users/' + username);
      
      await set(userRef, {
        username,
        password
      });

      alert('User signed up successfully');
      console.log('User signed up successfully with username: ' + username);

    } catch (error) {
      console.error('Error signing up: ', error);
      alert('Error signing up: ' + error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userRef = ref(database, 'users/' + username);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        if (userData.password === password) {
          alert('Login successful');
          setUserData({ username });
          router.push('/news');
        
    } else {
          alert('Incorrect password');
        }
      } else {
        alert('User not found');
      }
    } catch (error) {
      console.error('Error logging in: ', error);
    }
  };

  return (


       <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={isLogin ? handleLogin : handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? " Sign Up" : ' Login'}
          </button>
        </div>

       


      </div>
    </div>
  );
}

export default Auth;


































  // const handleClick = async () => {
  //   setLoading(true);
  //   setError(null);
  //   setData(null);

  //   try {
  //     const response = await axios.get('https://catfact.ninja/fact');
  //     setData(response.data);
  //   } catch (error) {
  //     setError('Error fetching data');
  //     console.error('Error fetching data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };