import { Route, Routes } from "react-router-dom";
import Home from "./routes/Home";
import HeroDetail from "./routes/HeroDetail";
import NotFound from "./routes/NotFound";

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/hero/:id" element={<HeroDetail />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
