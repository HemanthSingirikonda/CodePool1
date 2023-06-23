
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import toast, { Toaster } from 'react-hot-toast';


function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </div>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/editor/:roomId" element={<EditorPage/>}></Route>
          </Routes>

      </BrowserRouter>


    </>
  );
}

export default App;
