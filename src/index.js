import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';  // Import Provider from react-redux
import store from './redux/store';         // Import the configured Redux store
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>  {/* Provide the Redux store */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
