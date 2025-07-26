import {useEffect, useState} from "react";
import { useAuth } from "./AuthContext";

function History() {
    const { user } = useAuth();
    const [history, setHistory] = useState(<></>);

    function getHistory() {
        if (!user) {
            setHistory(<></>);
            return;
        }

        fetch('http://localhost:8000/moods', {
            method: "GET",
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }
                return response.json();
            })
            .then(data => {
                // Limit to 5 most recent entries
                const limitedData = data.slice(0, 5);
                const historyRows = limitedData.map((entry) => {
                    return (
                        <tr key={entry.timestamp}>
                            <td><img src={entry.image_data} alt={"img"}/></td>
                            <td>{entry.mood}</td>
                            <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                    );
                });
                setHistory(historyRows);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setHistory(<></>);
            });
    }

    useEffect(() => {
        getHistory();
    }, [user]); // Re-fetch when user changes (login/logout)
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