import React from 'react';
import ReactDOM from 'react-dom/client';
import UseQuery from './useQuery/useQuery';
import UseManyQuery from './useQuery/useManyQuery'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <UseManyQuery />
);
