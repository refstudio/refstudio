import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { WelcomeView } from './application/views/WelcomeView';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WelcomeView className="h-screen bg-transparent" hideShortcuts />
  </React.StrictMode>,
);
