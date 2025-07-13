import './App.css';
import Upload from "./Components/Upload";
import History from "./Components/History";

function App() {
    return (
        <>
            <header>
                <h1>Mental Health App</h1>
                <nav>
                    <a id="btn" href="#">History</a>
                    <a id="btn" href="#">Login</a>
                </nav>
            </header>

            <Upload/>
            <History/>

            <footer>Mental Health 2025</footer>
            <div className="App">

            </div>
        </>
    );
}

export default App;
