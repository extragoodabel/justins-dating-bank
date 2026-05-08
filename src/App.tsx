import JustinWorkspace from './JustinWorkspace'
import { ThemeProvider } from './theme/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <JustinWorkspace />
    </ThemeProvider>
  )
}
