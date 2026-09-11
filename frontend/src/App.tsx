import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ContainerPage } from "./pages/ContainerPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/containers/:id" element={<ContainerPage />} />
    </Routes>
  );
}

export default App;
