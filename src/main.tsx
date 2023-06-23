import './index.css';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    </ChakraProvider>
  </React.StrictMode>,
);
