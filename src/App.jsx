import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Keyboard from "./components/keyboard";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Keyboard />
    </>
  )
}

export default App
