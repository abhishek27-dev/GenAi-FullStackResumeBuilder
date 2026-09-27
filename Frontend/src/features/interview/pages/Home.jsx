import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";
import Navbar from "../../../components/Navbar.jsx";

const Home = () => {
    const { loading, generating, generateReport, reports, deleteReport } =
        useInterview();
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [formError, setFormError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const resumeInputRef = useRef(null);
    const navigate = useNavigate();

    const handleDeleteReport = async (e, reportId) => {
        e.stopPropagation();
        if (
            !window.confirm(
                "Are you sure you want to delete this interview plan?",
            )
        ) {
            return;
        }
        setDeletingId(reportId);
        try {
            await deleteReport(reportId);
        } catch (err) {
            alert(err.message || "Failed to delete plan.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
                setFormError("Please upload a valid PDF document.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setFormError("Resume file size must be under 5MB.");
                return;
            }
            setFormError("");
            setSelectedFile(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
                setFormError("Please upload a valid PDF document.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setFormError("Resume file size must be under 5MB.");
                return;
            }
            setFormError("");
            setSelectedFile(file);
        }
    };

    const removeSelectedFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        if (resumeInputRef.current) {
            resumeInputRef.current.value = "";
        }
    };

    const handleGenerateReport = async () => {
        setFormError("");

        if (!jobDescription.trim()) {
            setFormError("Please provide the Target Job Description.");
            return;
        }

        if (!selectedFile && !selfDescription.trim()) {
            setFormError(
                "Please upload a Resume PDF OR provide a Quick Self-Description to tailor the interview plan.",
            );
            return;
        }

        try {
            const data = await generateReport({
                jobDescription: jobDescription.trim(),
                selfDescription: selfDescription.trim(),
                resumeFile: selectedFile,
            });

            if (data?._id) {
                navigate(`/interview/${data._id}`);
            }
        } catch (err) {
            setFormError(err.message || "Failed to generate report. Please try again.");
        }
    };

    return (
        <div className="home-wrapper">
            <Navbar />

            {/* AI Generation Loading Overlay */}
            {generating && (
                <div className="generation-overlay">
                    <div className="generation-modal">
                        <div className="generation-spinner-ring">
                            <div className="spinner-core"></div>
                            <span className="ai-icon">✨</span>
                        </div>
                        <h2>GenAI Architect is Working...</h2>
                        <p className="generation-sub">
                            Analyzing job expectations, matching your profile, and generating custom questions &amp; preparation strategy.
                        </p>
                        <div className="generation-steps">
                            <div className="step-item step--active">
                                <span className="step-dot"></span>
                                <span>Parsing Job Description &amp; Candidate Experience</span>
                            </div>
                            <div className="step-item step--active">
                                <span className="step-dot"></span>
                                <span>Evaluating Technical &amp; Behavioral Alignment</span>
                            </div>
                            <div className="step-item step--active">
                                <span className="step-dot"></span>
                                <span>Synthesizing Model Answers &amp; Road Map</span>
                            </div>
                        </div>
                        <div className="generation-progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="home-page">
                {/* Page Header */}
                <header className="page-header">
                    <div className="page-pill">
                        <span className="pill-dot"></span>
                        AI-Powered Career Intelligence
                    </div>
                    <h1>
                        Supercharge Your <span className="highlight">Interview Preparation</span>
                    </h1>
                    <p>
                        Feed in any job description and your resume. Gemini GenAI will reverse-engineer the interviewer's mindset, identify your skill gaps, and generate tailored interview answers.
                    </p>
                </header>

                {formError && (
                    <div className="form-error-banner" role="alert">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{formError}</span>
                    </div>
                )}

                {/* Main Card */}
                <div className="interview-card">
                    <div className="interview-card__body">
                        {/* Left Panel - Job Description */}
                        <div className="panel panel--left">
                            <div className="panel__header">
                                <span className="panel__icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="2"
                                            y="7"
                                            width="20"
                                            height="14"
                                            rx="2"
                                            ry="2"
                                        />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </span>
                                <h2>Target Job Description</h2>
                                <span className="badge badge--required">
                                    Required
                                </span>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => {
                                    setJobDescription(e.target.value);
                                    if (formError) setFormError("");
                                }}
                                className="panel__textarea"
                                placeholder={`Paste the job description here...\ne.g. 'Full Stack Developer at TechCorp. Requirements: React, Node.js, Express, MongoDB, REST APIs, Microservices, System Architecture...'`}
                                maxLength={5000}
                            />
                            <div className="char-counter">
                                <span className={jobDescription.length > 4500 ? "near-limit" : ""}>
                                    {jobDescription.length}
                                </span>{" "}
                                / 5000 chars
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="panel-divider" />

                        {/* Right Panel - Profile */}
                        <div className="panel panel--right">
                            <div className="panel__header">
                                <span className="panel__icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <h2>Your Profile</h2>
                            </div>

                            {/* Upload Resume */}
                            <div className="upload-section">
                                <div className="section-label-row">
                                    <label className="section-label">
                                        Upload Resume
                                    </label>
                                    <span className="badge badge--best">
                                        Best Results
                                    </span>
                                </div>

                                <div
                                    className={`dropzone ${isDragOver ? "dropzone--dragover" : ""} ${selectedFile ? "dropzone--selected" : ""}`}
                                    onClick={() => resumeInputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragOver(true);
                                    }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={handleDrop}
                                >
                                    {selectedFile ? (
                                        <div className="file-preview">
                                            <div className="file-info">
                                                <span className="file-icon">📄</span>
                                                <div className="file-details">
                                                    <p className="file-name">{selectedFile.name}</p>
                                                    <p className="file-size">
                                                        {(selectedFile.size / 1024).toFixed(1)} KB (PDF)
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-file-btn"
                                                onClick={removeSelectedFile}
                                                title="Remove this file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="dropzone__icon">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="28"
                                                    height="28"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="16 16 12 12 8 16" />
                                                    <line x1="12" y1="12" x2="12" y2="21" />
                                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                                </svg>
                                            </span>
                                            <p className="dropzone__title">
                                                Click to upload or drag &amp; drop
                                            </p>
                                            <p className="dropzone__subtitle">
                                                PDF format only (Max 5MB)
                                            </p>
                                        </>
                                    )}

                                    <input
                                        ref={resumeInputRef}
                                        hidden
                                        type="file"
                                        id="resume"
                                        name="resume"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* OR Divider */}
                            <div className="or-divider">
                                <span>OR</span>
                            </div>

                            {/* Quick Self-Description */}
                            <div className="self-description">
                                <label
                                    className="section-label"
                                    htmlFor="selfDescription"
                                >
                                    Quick Self-Description
                                </label>
                                <textarea
                                    value={selfDescription}
                                    onChange={(e) => {
                                        setSelfDescription(e.target.value);
                                        if (formError) setFormError("");
                                    }}
                                    id="selfDescription"
                                    name="selfDescription"
                                    className="panel__textarea panel__textarea--short"
                                    placeholder="Briefly describe your experience, primary tech stack (e.g. MERN, Python, Java), projects, and skills if you don't have a resume handy..."
                                />
                            </div>

                            {/* Info Box */}
                            <div className="info-box">
                                <span className="info-box__icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line
                                            x1="12"
                                            y1="8"
                                            x2="12"
                                            y2="12"
                                            stroke="#1a1f27"
                                            strokeWidth="2"
                                        />
                                        <line
                                            x1="12"
                                            y1="16"
                                            x2="12.01"
                                            y2="16"
                                            stroke="#1a1f27"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                </span>
                                <p>
                                    Either a <strong>Resume PDF</strong> or a{" "}
                                    <strong>Self Description</strong> is needed so our AI can customize questions and answers to your background.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="interview-card__footer">
                        <span className="footer-info">
                            Powered by Google Gemini 2.5 Flash &bull; Tailored Interview Simulation
                        </span>
                        <button
                            onClick={handleGenerateReport}
                            className="generate-btn"
                            disabled={generating}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                            </svg>
                            {generating ? "Crafting Strategy..." : "Generate Interview Strategy"}
                        </button>
                    </div>
                </div>

                {/* Recent Reports Section */}
                <section className="recent-reports">
                    <div className="reports-header">
                        <h2>Your Previous Interview Plans</h2>
                        <span className="reports-count">
                            {reports.length} {reports.length === 1 ? "plan" : "plans"} saved
                        </span>
                    </div>

                    {loading ? (
                        <div className="reports-loading">
                            <span className="mini-spinner"></span>
                            Loading history...
                        </div>
                    ) : reports.length > 0 ? (
                        <div className="reports-list">
                            {reports.map((report) => (
                                <div
                                    key={report._id}
                                    className="report-item"
                                    onClick={() =>
                                        navigate(`/interview/${report._id}`)
                                    }
                                >
                                    <div className="report-item__top">
                                        <h3>{report.title || "Target Role Plan"}</h3>
                                        <div className="report-item__top-actions">
                                            <span
                                                className={`match-score-badge ${
                                                    report.matchScore >= 80
                                                        ? "score--high"
                                                        : report.matchScore >= 60
                                                          ? "score--mid"
                                                          : "score--low"
                                                }`}
                                            >
                                                {report.matchScore}% Match
                                            </span>
                                            <button
                                                type="button"
                                                className="delete-report-btn"
                                                title="Delete this plan"
                                                disabled={deletingId === report._id}
                                                onClick={(e) =>
                                                    handleDeleteReport(
                                                        e,
                                                        report._id,
                                                    )
                                                }
                                            >
                                                {deletingId === report._id ? (
                                                    <span className="mini-delete-spinner"></span>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        <line x1="10" y1="11" x2="10" y2="17" />
                                                        <line x1="14" y1="11" x2="14" y2="17" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="report-meta">
                                        Created:{" "}
                                        {new Date(
                                            report.createdAt,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <div className="report-action">
                                        <span>View Complete Analysis &rarr;</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-reports-state">
                            <span className="empty-icon">🎯</span>
                            <p>No interview preparation plans yet.</p>
                            <span className="empty-sub">
                                Paste a job description above and hit "Generate Interview Strategy" to begin!
                            </span>
                        </div>
                    )}
                </section>

                {/* Page Footer */}
                <footer className="page-footer">
                    <p>&copy; {new Date().getFullYear()} GenAI Career Architect &bull; Built with Google Gemini &amp; Node.js</p>
                </footer>
            </div>
        </div>
    );
};

export default Home;
