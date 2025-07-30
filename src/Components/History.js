import {useEffect, useState} from "react";
import {useAuth} from "./AuthContext";
import HistoryRow from "./HistoryRow";

export default function History() {
    const {user} = useAuth();
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
                const historyRows = data.map((entry) => {
                    return (
                        <HistoryRow getHistory={getHistory} key={entry.id}>{entry}</HistoryRow>
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