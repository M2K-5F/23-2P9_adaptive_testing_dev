import { createRoot } from 'react-dom/client' 
import './styles/style.css'
import RoutePaths from './routes/Routes'

createRoot(document.getElementById('root')!).render(
    <RoutePaths />
)
