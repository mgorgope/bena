
'use client';


import React, { useState, useEffect } from 'react';
import { useUserData } from './context';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { IconButton } from '@mui/material';
import truncateUrl  from './news/page'
import {CardProps, NewsArticle} from './type/iCardProps'


export const Card: React.FC<CardProps> = ({ id, text, isRead, onClick, onButtonClick, newsData }) => {
    return (
      <div className={`card ${isRead ? 'read' : ''}`} onClick={onClick}>
          <span>{text}</span>
          {newsData && (
              <div className="news-data">
                  <h3>{newsData.title}</h3>
                  <p>{newsData.description}</p>
                  <p>
                  <a href={newsData.url} target="_blank"  rel="noopener noreferrer"  style={{ backgroundColor: '#f0f0f0', padding: '5px', borderRadius: '5px' }} >
                          {truncateUrl(newsData.url, 30)}
                      </a>
                  </p>
              </div>
          )}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onButtonClick();
        }}
        color="primary"
        aria-label="Mark as read"
      >
        {isRead ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </IconButton>
    </div>

  );
};
export default Card;
