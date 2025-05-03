import { createRoot } from 'react-dom/client' 
import './styles/main.css'
import RoutePaths from './Static/Routes'

createRoot(document.getElementById('root')).render(
  RoutePaths()
)
