import {useState} from "react";

export default function HistoryRow(props) {
    const [hovered, setHovered] = useState(false);
    const getHistory = props.getHistory;
    const entry = props.children;
    return (
        <tr key={entry.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <td><img src={entry.image_data} alt={"img"}/></td>
            <td>{entry.mood}</td>
            {!hovered && <td>{new Date(entry.timestamp).toLocaleString()}</td>}
            {hovered && <td>
                <button onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this entry?')) {
                        await fetch(`http://localhost:8000/moods/${entry.id}`, {
                            method: "DELETE",
                            credentials: "include"
                        });
                        await getHistory();
                    }
                }}>Delete
                </button>
            </td>
            }
        </tr>
    );
}