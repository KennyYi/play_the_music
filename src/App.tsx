import "./App.css";
import { MusicContextProvider } from "./context/MusicContext";
import SelectPage from "./page/SelectPage";

function App() {
  return (
    <MusicContextProvider>
      <SelectPage />
    </MusicContextProvider>
  );
}

export default App;
