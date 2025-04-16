import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  return (
    <div className="my-auto flex min-h-screen max-w-screen flex-col items-center justify-center p-8">
      <div className="m-8 flex flex-row">
        <a href="https://vite.dev" target="_blank">
          <img
            src={viteLogo}
            className="h-12 p-2 hover:opacity-60"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="h-12 animate-spin p-2 hover:opacity-60"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-4xl">Vite + React</h1>
      <div className="m-8">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
