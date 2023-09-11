import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppStartup } from './AppStartup';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <AppStartup />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);

// function App() {
//   const [start, setStart] = useState(false);

//   return (
//     <div>
//       <h1>Hello Tauri!</h1>
//       <button
//         className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
//         onClick={() => {
//           setStart(true);
//         }}
//       >
//         Start server
//       </button>
//       {start && <ServerStart />}
//     </div>
//   );
// }

// function ServerStart() {
//   const isServerRunning = useRefStudioServerOnDesktop();
//   console.log('isServerRunning=', isServerRunning);
//   return <div>isServerRunning: {isServerRunning ? 'TRUE' : 'FALSE'}</div>;
// }
