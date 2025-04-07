import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Keyboard from "./components/Keyboard/Keyboard";
import TextArea from "./components/TextArea/TextArea";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TextArea />
      <Keyboard />
    </>
  )
}

export default App
