import {useEffect, useState} from "react";


function History({isLoggedIn}) {

    const [history, setHistory] = useState(<></>);

    function getHistory() {
        if (!isLoggedIn) return;
        fetch('localhost:8000/moods', {
            method: "GET",
            credentials: "include"
        })
            .then(response => response.json())
            .then(data => {
                data = data.map((entry) => {
                    return (
                        <tr key={entry.timestamp}>
                            <td><img src={entry.img} alt={"img"}/></td>
                            <td>{entry.emotion}</td>
                            <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                    );
                });
                setHistory(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    useEffect(getHistory, [isLoggedIn]);
    return (
        <section id="history-section">
            <h2>Scan History</h2>
            <div id="history-container">
                <table id="history-list">
                    <thead>
                    <tr>
                        <th>Image</th>
                        <th>Emotion</th>
                        <th>Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default History;