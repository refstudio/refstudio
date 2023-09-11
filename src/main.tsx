import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <div>Hello Tauri!</div>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
