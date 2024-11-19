
import ItemTable from './Components/pages/ItemTable/ItemTable';
import {BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import ItemDetail from './Components/pages/ItemDetail/ItemDetail';
import NavBar from './Components/layouts/NavBar/NavBar';
import Footer from './Components/layouts/Footer/Footer';
import InformationDetail from './Components/pages/InformationDetail/InformationDetail';

function App() {
  return <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<ItemTable />} />
          <Route path="/file/:file_id" element={<ItemDetail />} />
          <Route path="/info" element={<InformationDetail />} />
        </Routes>
        <Footer />
        </BrowserRouter>
}

export default App;
