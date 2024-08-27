export interface CardProps {
    id: number;
    text: string;
    isRead: boolean;
    onClick: () => void;
    onButtonClick: () => void;
    newsData?: NewsArticle; 
    
    // New prop for displaying API data
  }

  export interface NewsArticle {
    title: string;
    description: string;
    url: string;
  }