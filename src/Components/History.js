import {useEffect, useState} from "react";


function History() {

    const [history, setHistory] = useState(<></>);

    function getHistory() {
        fetch('http://localhost:8000/moods', {
            method: "GET",
            credentials: "include"
        })
            .then(response => response.json())
            .then(data => {
                data = data.map((entry) => {
                    return (
                        <tr key={entry.timestamp}>
                            <td><img src={entry.image_data} alt={"img"}/></td>
                            <td>{entry.mood}</td>
                            <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                    );
                });
                setHistory(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    useEffect(getHistory, []);
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