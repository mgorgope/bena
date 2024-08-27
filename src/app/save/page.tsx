'use client';


import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { useUserData } from '../context';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { IconButton } from '@mui/material';
import { Router } from 'next/router';
import { useRouter } from 'next/navigation'; 

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


const truncateUrl = (url: string, maxLength: number = 150): string => {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + '...';
};

const ShowData: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const { userData } = useUserData(); // קבלת המידע של המשתמש מהקונטקסט
  const router = useRouter(); 


  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.username) return;

      try {
        const dataRef = ref(database, `cards/${userData.username}`);
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
          setData(snapshot.val());

        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userData?.username]);
  useEffect(() => {
    if (!userData) {
      router.push('/'); // Redirect to the main page
    }
  }, [userData, router]);

  return (
    <>
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
    <h1>Data for {userData?.username}</h1>
    {data ? (
      <ul>
        {Object.keys(data).map((key) => (
          <li key={key} style={{ marginBottom: '10px' }}>
            <a href={data[key]} target="_blank" style={{ backgroundColor: '#f0f0f0', color: 'black', padding: '5px', display: 'inline-block', textDecoration: 'none', borderRadius: '3px' }}>
              {truncateUrl(data[key])}
            </a>
            </li>
        ))}
      </ul>
    ) : (
      <p>Loading data...</p>
    )}
    </div>
    </>
  );
};

export default ShowData;