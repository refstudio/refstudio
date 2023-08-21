import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Logo } from './application/views/Logo';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className='flex justify-center items-center w-full h-full'>
      <Logo />
    </div>
  </React.StrictMode>,
);
