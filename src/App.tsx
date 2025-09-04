import "./App.css";
import { GameContextProvider } from "./context/GameContext";
import { MusicContextProvider } from "./context/MusicContext";
import MainPage from "./page/MainPage";

function App() {
  return (
    <GameContextProvider>
      <MusicContextProvider>
        <MainPage />
      </MusicContextProvider>
    </GameContextProvider>
  );
}

export default App;
