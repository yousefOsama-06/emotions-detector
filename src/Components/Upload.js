import {useState, useRef} from "react";

function Upload({setResult}) {
    const [error, setError] = useState("");
    const [imgSrc, setImgSrc] = useState("null");
    const [dragActive, setDragActive] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const [stream, setStream] = useState(null);
    const inputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    function preview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                setImgSrc(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        preview(file);
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            preview(e.dataTransfer.files[0]);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }

    function openFileDialog() {
        inputRef.current.click();
    }

    function check() {
        if (!imgSrc || imgSrc === "null") {
            setError("An image is required");
            return false;
        }
        setError("");
        return true;
    }


    async function analyze() {
        setResult({});
        if (check()) {
            const formData = new FormData();
            const base64Response = await fetch(imgSrc);
            const blob = await base64Response.blob();

            // Create a file from the blob
            const file = new File([blob], "image.jpg", {type: "image/jpeg"});
            formData.append("photo", file);
            // You can use formData to send the data to a server

            fetch("http://localhost:8000/analyze-image", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
                .then(response => response.json()) // parses JSON string into JS array
                .then(data => {
                    setResult(data.analysis);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    }

    // Webcam logic
    async function openWebcam() {
        setShowWebcam(true);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({video: true});
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Could not access webcam: " + err.message);
        }
    }

    function closeWebcam() {
        setShowWebcam(false);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }

    function capturePhoto() {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setImgSrc(dataUrl);
            closeWebcam();
        }
    }

    return (
        <>
            <section id="upload-section">
                <h2>Upload a Picture</h2>
                <div id="error-message" style={{color: "red"}}>{error}</div>
                {!showWebcam && (<form id="upload-form" onSubmit={e => e.preventDefault()}>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div
                            className={`dropzone${dragActive ? " active" : ""}`}
                            onClick={openFileDialog}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            tabIndex={0}
                            role="button"
                            aria-label="Drag and drop image or click to select"
                        >
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                ref={inputRef}
                                style={{display: "none"}}
                                onChange={handleFileChange}
                            />
                            <div className="dropzone-content">
                                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2"
                                     strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="18" height="18" rx="4"/>
                                    <path d="M8 12l2 2 4-4"/>
                                    <path d="M16 16h.01"/>
                                </svg>
                                <span>Drag & drop or <u>click</u> to select an image</span>
                            </div>
                        </div>
                        <button type="button" className="webcam-btn" onClick={openWebcam}
                                aria-label="Take a photo from webcam">
                            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="3" y="7" width="18" height="13" rx="3"/>
                                <circle cx="12" cy="13.5" r="3.5"/>
                                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            <span style={{marginLeft: 6}}>Take Photo</span>
                        </button>
                    </div>
                    {imgSrc && imgSrc !== "null" && (
                        <img id="preview-image" name="preview-image" src={imgSrc} alt="preview"
                             style={{maxWidth: '300px', marginTop: '10px'}}/>
                    )}
                    <br/>
                    <button type="button" id="submit-btn" onClick={analyze}>Analyze Emotion</button>
                </form>)}
                {showWebcam && (
                    <div className="webcam-modal">
                        <div className="webcam-content">
                            <video ref={videoRef} autoPlay playsInline
                                   style={{maxWidth: '100%', maxHeight: '100%', borderRadius: '12px'}}/>
                            <div
                                style={{display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px'}}>
                                <button type="button" className="webcam-capture-btn"
                                        onClick={capturePhoto}>Capture
                                </button>
                                <button type="button" className="webcam-cancel-btn" onClick={closeWebcam}>Cancel
                                </button>
                            </div>
                            <canvas ref={canvasRef} style={{display: 'none'}}/>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

export default Upload;