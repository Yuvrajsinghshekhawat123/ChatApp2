import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { persistor, store } from './00-app/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import SocketProvider from './07-providers/SocketProvider.jsx'

 createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*Connect RTK to react */}
    <Provider store={store}>  
        
    <PersistGate loading={null} persistor={persistor}>
      <SocketProvider>
          <App />
        </SocketProvider>
    </PersistGate>
    
    </Provider> 
  </StrictMode>,
)
