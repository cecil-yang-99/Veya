import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import 'antd/dist/reset.css';
import App from './App';
import { antdTheme } from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={enUS} theme={antdTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
