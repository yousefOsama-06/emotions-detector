import {useEffect, useState} from "react";

function Analysis(props) {
    const [view, setView] = useState("No analysis yet.");


    useEffect(() => {
        if (props.children && Object.values(props.children).join('').trim()) {
            setView(Object.entries(props.children).map(([key, value]) => {
                    return (
                        <span key={key}><b>{key}:</b> {value}<br/></span>
                    );
                })
            );
        } else
            setView("No analysis yet.");
    }, [props.children]);

    return (
        <section id="analysis-section">
            <h2>Emotion Analysis</h2>
            <p id="emotion-result">{view}</p>

            <div id="result-container"></div>
        </section>);
}

export default Analysis;
