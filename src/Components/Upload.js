import {useState} from "react";
import Analysis from "./Analysis";

function Upload() {

    const [error, setError] = useState("");
    const [borderColor, setBorderColor] = useState('black');

    function validateLength(input) {
        const value = input.value;
        const isValid = value.length >= 3;
        setBorderColor(isValid ? "" : "red");
        setError(isValid ? "" : "Username is too short.");
        return isValid;
    }

    const [imgSrc, setImgSrc] = useState("null");

    function preview(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                setImgSrc(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function check() {
        const username = document.getElementById("username");
        const image = document.getElementById("image").value;
        if (!image || !validateLength(username)) {
            setError("Both username and image are required");
            return false;
        }
        setError("");
        return true;
    }

    const [result, setResult] = useState({});

    function analyze() {
        setResult({});
        if (check()) {
            const form = document.getElementById('upload-form')
            const formData = new FormData(form);
            // You can use formData to send the data to a server

            fetch("http://127.0.0.1:8000/analyze", {
                method: "POST",
                body: formData
            })
                .then(response => response.json()) // parses JSON string into JS array
                .then(data => {
                    setResult(data);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    }

    // useEffect(analyze, []);

    return (
        <>
            <section id="upload-section">
                <h2>Upload a Picture</h2>

                <div id="error-message" style={{color: "red"}}>{error}</div>

                <form id="upload-form">
                    <label htmlFor="username"></label>
                    <input type="text" id="username" name="username" placeholder="Enter your name"
                           style={{borderColor: borderColor}}
                           onChange={(e) => validateLength(e.target)}/>

                    <br/><br/>

                    <input type="file" id="image" name="image" accept="image/*"
                           onChange={(e) => preview(e.target)}/>
                    <br/><br/>

                    <button type="button" id="submit-btn" onClick={analyze}>Analyze Emotion</button>
                </form>

                <img id="preview-image" src={imgSrc} alt="preview"
                     style={{
                         display: (imgSrc && imgSrc !== "null") ? "Block" : "None",
                         maxWidth: '300px',
                         marginTop: '10px'
                     }}/>
            </section>
            <Analysis>
                {result}
            </Analysis>
        </>
    );
}

export default Upload;