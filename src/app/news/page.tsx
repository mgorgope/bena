
'use client';


import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { useUserData } from '../context';
import { useRouter } from 'next/navigation'; 
import Card from '../card-component'
import {CardProps, NewsArticle} from '../type/iCardProps'
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { IconButton } from '@mui/material';



function checkEnv(
  value: string | undefined,
  name: string,
): asserts value is string {
  if (value == null) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}


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




// interface CardProps {
//     id: number;
//     text: string;
//     isRead: boolean;
//     onClick: () => void;
//     onButtonClick: () => void;
//     newsData?: NewsArticle; 
    
//     // New prop for displaying API data
//   }

//   interface NewsArticle {
//     title: string;
//     description: string;
//     url: string;
//   }
  
  const truncateUrl = (url: string, maxLength: number) => {
    return url.length > maxLength ? url.slice(0, maxLength) + '... full article' : url;
};

const generateUniqueId = (url: string) => {
    return url.replace(/[.\#\$\[\]\/]/g, '_');
};                                                                      

  // const Card: React.FC<CardProps> = ({ id, text, isRead, onClick, onButtonClick, newsData }) => {
  //     return (
  //       <div className={`card ${isRead ? 'read' : ''}`} onClick={onClick}>
  //           <span>{text}</span>
  //           {newsData && (
  //               <div className="news-data">
  //                   <h3>{newsData.title}</h3>
  //                   <p>{newsData.description}</p>
  //                   <p>
  //                   <a href={newsData.url} target="_blank"  rel="noopener noreferrer"  style={{ backgroundColor: '#f0f0f0', padding: '5px', borderRadius: '5px' }} >
  //                           {truncateUrl(newsData.url, 30)}
  //                       </a>
  //                   </p>
  //               </div>
  //           )}
  //       <IconButton
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           onButtonClick();
  //         }}
  //         color="primary"
  //         aria-label="Mark as read"
  //       >
  //         {isRead ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
  //       </IconButton>
  //     </div>
  
  //   );
  // };
  
  const App: React.FC = () => {
    const [readCards, setReadCards] = useState<Set<number>>(new Set());
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [username1, setUsername1] = useState<string>('');
    const router = useRouter(); 

    const { userData } = useUserData(); 
  


    useEffect(() => {
        const fetchNewsData = async () => {
          const apiKey = checkEnv(process.env.NEXT_PUBLIC_NEWS_API_KEY_url, 'NEXT_PUBLIC_NEWS_API_KEY');
          const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;        
                try {
                const response = await fetch(url);
                const data = await response.json();
                console.log('API Response:', data);
                if (data.articles && data.articles.length > 0) {
                    setArticles(data.articles.slice(0, 9));
                }
            } catch (error) {
                console.error('Error fetching news data:', error);
            }
        };

        fetchNewsData();
    }, []);

    useEffect(() => {
      // Load read status of cards when username changes
      const loadReadCards = async () => {
        if (!username1) return;
  
        const cardsRef = ref(database, 'cards');
        const snapshot = await get(cardsRef);
  
        if (snapshot.exists()) {
          const cardsData = snapshot.val();
          const newReadCards = new Set<number>();
  
          for (const user in cardsData) {
            if (cardsData[user] && cardsData[user][truncateUrl(articles[0]?.url || '', 30)]) {
                newReadCards.add(Number(user));
            }
        }
  
          setReadCards(newReadCards);
        }
      };
  
      loadReadCards();
    },[username1, articles]);

 
  
    const handleCardClick = (id: number) => {
      setReadCards(prev => {
        const newReadCards = new Set(prev);
        if (newReadCards.has(id)) {
          newReadCards.delete(id);
        } else {
          newReadCards.add(id);
        }
        updateCardInFirebase(id, !newReadCards.has(id));
        return newReadCards;
      });
    };
  
    const handleButtonClick = async (id: number) => {
      try {
        alert(`לחצת על כפתור בכרטיסייה מספר ${id + 1}`);
        setReadCards(prev => {
          const newReadCards = new Set(prev);
          if (newReadCards.has(id)) {
            newReadCards.delete(id);
          } else {
            newReadCards.add(id);
          }
          updateCardInFirebase(id, !newReadCards.has(id));
          return newReadCards;
        });
      } catch (error) {
        console.error('Error updating read status:', error);
        alert('There was an error updating the read status.');
      }
    };

    const updateCardInFirebase = async (cardId: number, isRead: boolean) => {
        try {
          const cardRef = ref(database, `cards/${userData?.username}`);
          const snapshot = await get(cardRef);
          const existingUsers = snapshot.exists() ? snapshot.val() : {};
          const newsData = articles[cardId]; 
               
          if (userData?.username && newsData) {
            const urlKey = generateUniqueId(newsData.url);
            const urlCount = Object.keys(existingUsers).length + 1;
            const uniqueId = `url_${urlCount}`; 
            if (!existingUsers[urlKey]) {
                existingUsers[uniqueId] = newsData.url; 
            }
        }

          await set(cardRef, existingUsers);

          console.log('Card updated successfully');
        } catch (error) {
          console.error('Error updating card in Firebase:', error);
        }
      };
      
    return (
      <>
        <nav style={{width: '100%', backgroundColor: '#f8f9fa', padding: '10px', textAlign: 'center', boxShadow: '0px 4px 2px -2px gray' }}>
          Welcome: {userData?.username}
        </nav>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box',
            }}
          >
            {articles.map((article, index) => (
             <div key={index} className="max-w-md mx-auto p-4 bg-white shadow-md rounded" style={{ maxWidth: '400px', margin: '10px' ,marginBottom: '0'}}>
                            <Card id={index} text={`כרטיסייה מספר ${index + 1}`} isRead={readCards.has(index)} onClick={() => handleCardClick(index)} onButtonClick={() => handleButtonClick(index)} newsData={article} />  </div>

            ))}
          </div>
          
        </div>
        <div style={{ marginTop: 'auto' }}>
        <button style={{width: '100%', backgroundColor: '#f8f9fa', padding: '10px', textAlign: 'center', boxShadow: '0px 4px 2px -2px gray' }} 
        onClick={() => {console.log('Navigating to /save'); router.push('/save');}}>Show Data</button>
        </div>
        </>
    );
  };

export default App;






// import React, { useState, useEffect } from 'react';
// import { getDatabase, ref, set, get, update } from 'firebase/database';
// import { initializeApp } from 'firebase/app';
// import { useUserData } from '../cards';
// import CheckBoxIcon from '@mui/icons-material/CheckBox';
// import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
// import { IconButton } from '@mui/material';


// const firebaseConfig = {
//   apiKey: "AIzaSyBb2n1uNe4shCPVbcgyuxTSADJB8YsGgqY",
//   authDomain: "beni-9b8ce.firebaseapp.com",
//   projectId: "beni-9b8ce",
//   storageBucket: "beni-9b8ce.appspot.com",
//   messagingSenderId: "1044368159074",
//   appId: "1:1044368159074:web:a12f5dfefadf7591093c3b",
//   measurementId: "G-V195H57LEB"
// };

// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

// interface CardProps {
//   id: number;
//   text: string;
//   isRead: boolean;
//   onClick: () => void;
//   onButtonClick: () => void;
// }

// const Card: React.FC<CardProps> = ({ id, text, isRead, onClick, onButtonClick }) => {
//   return (
//     <div className={`card ${isRead ? 'read' : ''}`} onClick={onClick}>
//       <span>{text}</span>


      
//       <IconButton
//         onClick={(e) => {
//           e.stopPropagation();
//           onButtonClick();
//         }}
//         color="primary"
//         aria-label="Mark as read"
//       >
//         {isRead ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
//       </IconButton>
//     </div>
//   );
// };
// const App: React.FC = () => {
//     const [readCards, setReadCards] = useState<Set<number>>(new Set());
//     const [username1, setUsername1] = useState<string>('');
//     const { userData } = useUserData(); // Get userData from context

//     useEffect(() => {
//       // Load read status of cards when username changes
//       const loadReadCards = async () => {
//         if (!username1) return;
  
//         const cardsRef = ref(database, 'cards');
//         const snapshot = await get(cardsRef);
  
//         if (snapshot.exists()) {
//           const cardsData = snapshot.val();
//           const newReadCards = new Set<number>();
  
//           for (const cardId in cardsData) {
//             if (cardsData[cardId].users && cardsData[cardId].users[username1]) {
//               newReadCards.add(Number(cardId));
//             }
//           }
  
//           setReadCards(newReadCards);
//         }
//       };
  
//       loadReadCards();
//     }, [username1]);
  
//     const handleCardClick = (id: number) => {
//       setReadCards(prev => {
//         const newReadCards = new Set(prev);
//         newReadCards.add(id);
//         updateCardInFirebase(`card ${id}`)
//         return newReadCards;
//       });
//     };
  
//     const handleButtonClick = async (id: number) => {
//       try {
//         alert(`לחצת על כפתור בכרטיסייה מספר ${id}`);
//         setReadCards(prev => {
//           const newReadCards = new Set(prev);
//           newReadCards.add(id);
//           updateCardInFirebase(`card ${id}`)
//           return newReadCards;
//         });
//       } catch (error) {
//         console.error('Error updating read status:', error);
//         alert('There was an error updating the read status.');
//       }
//     };



    
  
//     const updateCardInFirebase = async (cardId: string) => {
//         try {   
//           const cardRef = ref(database, `cards/${cardId} called by `);
//           const snapshot = await get(cardRef);
//           const existingUsers = snapshot.exists() ? snapshot.val() : {};
      
//           if (userData?.username && !existingUsers[userData.username]) {
//             existingUsers[userData.username] = ` `;
//           }
      
//           await set(cardRef, existingUsers);
      
//           console.log('הכרטיס עודכן בהצלחה');
//         } catch (error) {
//           console.error('שגיאה בעדכון הכרטיס ב-Firebase:', error);
//         }
//       };
      
//     return (
//       <>
// <nav  style={{width: '100%', backgroundColor: '#f8f9fa', padding: '10px', textAlign: 'center', boxShadow: '0px 4px 2px -2px gray', }}>
//          welcome : {userData?.username}
//          </nav>
//        <div className="bg-white min-h-screen flex items-center justify-center">
       

//         <div
//    style={{
//     display: 'flex',
//     flexDirection: 'row', // סידור הכרטיסים בשורה
//     flexWrap: 'wrap', // מאפשר לכרטיסים לשבור שורות כאשר הם לא נכנסים בשורה אחת
//     justifyContent: 'center', // מיישר את הכרטיסים במרכז הרוחב
//     gap: '10px', // רווח בין כרטיסים
//     width: '100%', // מאפשר לכרטיסים לתפוס את כל הרוחב
//     padding: '10px', // רווח פנימי
//     boxSizing: 'border-box', // כולל את הרווח הפנימי ברוחב הכולל
//   }}
//   >          {[1, 2, 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(id => (
//             <div key={id} className="max-w-md mx-auto p-4 bg-white shadow-md rounded" style={{ maxWidth: '400px', margin: '10px' }}>
//               <Card
//                 id={id}
//                 text={`כרטיסייה מספר ${id}`}
//                 isRead={readCards.has(id)}
//                 onClick={() => handleCardClick(id)}
//                 onButtonClick={() => handleButtonClick(id)}
//               />
//             </div>
//           ))}
//         </div>
//         </div>
//       </>
//     );
//   };
  
//   export default App;
  