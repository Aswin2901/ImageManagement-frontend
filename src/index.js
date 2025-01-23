import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthProvider } from './components/context/AuthContext'; // Import the AuthProvider
import store from './redux/store';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider> {/* Wrap the app with AuthProvider */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
