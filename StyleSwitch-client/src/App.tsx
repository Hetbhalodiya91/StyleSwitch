import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
// import ClothCard from "./components/ClothCard";
import ClothGrid from "./components/ClothGrid";
import BrowsePage from "./pages/BrowsePage";

function App() {


  return (
    <>
      {/* <Navbar>
        <LandingPage />
      </Navbar>
      <ClothGrid/> */}
      <Navbar>
        <BrowsePage/>
      </Navbar>
      
    </>
  )
}

export default App
