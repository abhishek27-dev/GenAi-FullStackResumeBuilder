import React, { useState } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate, useParams, Link } from "react-router";
import Navbar from "../../../components/Navbar.jsx";

const NAV_ITEMS = [
    {
        id: "technical",
        label: "Technical Questions",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        ),
    },
    {
        id: "behavioral",
        label: "Behavioral Questions",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        id: "roadmap",
        label: "Road Map",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
        ),
    },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(index === 0);
    const [copied, setCopied] = useState(false);

    const handleCopyAnswer = (e) => {
        e.stopPropagation();
        const textToCopy = `Question: ${item.question}\n\nIntention: ${item.intention}\n\nModel Answer: ${item.answer}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`q-card ${open ? "q-card--open" : ""}`}>
            <div className="q-card__header" onClick={() => setOpen((o) => !o)}>
                <span className="q-card__index">Q{index + 1}</span>
                <p className="q-card__question">{item.question}</p>
                <div className="q-card__actions">
                    <button
                        className="q-copy-btn"
                        onClick={handleCopyAnswer}
                        title="Copy Question & Answer"
                    >
                        {copied ? (
                            <span className="copied-text">✓ Copied</span>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                        )}
                    </button>
                    <span
                        className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </span>
                </div>
            </div>
            {open && (
                <div className="q-card__body">
                    <div className="q-card__section">
                        <span className="q-card__tag q-card__tag--intention">
                            Interviewer's Intention
                        </span>
                        <p>{item.intention}</p>
                    </div>
                    <div className="q-card__section">
                        <span className="q-card__tag q-card__tag--answer">
                            Recommended Model Answer
                        </span>
                        <p className="answer-text">{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const RoadMapDay = ({ day }) => (
    <div className="roadmap-day">
        <div className="roadmap-day__header">
            <span className="roadmap-day__badge">Day {day.day}</span>
            <h3 className="roadmap-day__focus">{day.focus}</h3>
        </div>
        <ul className="roadmap-day__tasks">
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className="roadmap-day__bullet" />
                    <span>{task}</span>
                </li>
            ))}
        </ul>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState("technical");
    const {
        report,
        loading,
        downloadingPdf,
        getResumePdf,
        deleteReport,
        error,
    } = useInterview();
    const { interviewId } = useParams();
    const [deletingPlan, setDeletingPlan] = useState(false);
    const navigate = useNavigate();

    const handleDeletePlan = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete this interview plan? This action cannot be undone.",
            )
        ) {
            return;
        }
        setDeletingPlan(true);
        try {
            await deleteReport(interviewId);
            navigate("/");
        } catch (err) {
            alert(err.message || "Failed to delete plan.");
            setDeletingPlan(false);
        }
    };

    const handleDownloadResume = async () => {
        try {
            await getResumePdf(interviewId);
        } catch (err) {
            alert(err.message || "Failed to download tailored resume.");
        }
    };

    if (loading) {
        return (
            <div className="interview-page-wrapper">
                <Navbar />
                <main className="loading-screen">
                    <div className="loading-spinner-box">
                        <div className="spinner"></div>
                        <h2>Preparing Your Strategy Plan...</h2>
                        <p>Analyzing questions and match score</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="interview-page-wrapper">
                <Navbar />
                <main className="error-screen">
                    <div className="error-box">
                        <span className="error-icon">⚠️</span>
                        <h2>Report Not Found</h2>
                        <p>{error || "The requested interview report could not be found."}</p>
                        <Link to="/" className="button primary-button">
                            &larr; Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const scoreColor =
        report.matchScore >= 80
            ? "score--high"
            : report.matchScore >= 60
              ? "score--mid"
              : "score--low";

    const scoreLabel =
        report.matchScore >= 80
            ? "Strong match for this role"
            : report.matchScore >= 60
              ? "Moderate match - Focus on gaps"
              : "High gap - Requires intensive prep";

    return (
        <div className="interview-page-wrapper">
            <Navbar />

            <div className="interview-page">
                {/* Top Role Subheader */}
                <div className="interview-header-bar">
                    <div className="header-left">
                        <Link to="/" className="back-link">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back to Plans
                        </Link>
                        <div className="role-title-group">
                            <h1>{report.title || "Custom Interview Strategy"}</h1>
                            <span className="role-date">
                                Generated on{" "}
                                {new Date(report.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="header-right">
                        <button
                            type="button"
                            onClick={handleDeletePlan}
                            className="delete-plan-btn"
                            disabled={deletingPlan}
                            title="Delete this interview plan"
                        >
                            {deletingPlan ? (
                                <span className="btn-spinner"></span>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
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
                            <span>{deletingPlan ? "Deleting..." : "Delete Plan"}</span>
                        </button>
                        <button
                            onClick={handleDownloadResume}
                            className="button primary-button download-resume-btn"
                            disabled={downloadingPdf}
                        >
                            {downloadingPdf ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <svg
                                        height={"0.9rem"}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-4v8H3v-8H1v8a2 2 0 002 2h18a2 2 0 002-2v-8h-2z" />
                                    </svg>
                                    Download ATS Resume
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="interview-layout">
                    {/* ── Left Nav ── */}
                    <nav className="interview-nav">
                        <div className="nav-content">
                            <p className="interview-nav__label">Sections</p>
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className="interview-nav__icon">
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="nav-footer-box">
                            <p className="nav-hint">Need a tailored CV?</p>
                            <button
                                onClick={handleDownloadResume}
                                className="nav-download-link"
                                disabled={downloadingPdf}
                            >
                                {downloadingPdf ? "Generating..." : "Download Resume PDF"}
                            </button>
                        </div>
                    </nav>

                    <div className="interview-divider" />

                    {/* ── Center Content ── */}
                    <main className="interview-content">
                        {activeNav === "technical" && (
                            <section>
                                <div className="content-header">
                                    <h2>Technical Questions</h2>
                                    <span className="content-header__count">
                                        {report.technicalQuestions?.length || 0} questions
                                    </span>
                                </div>
                                <div className="q-list">
                                    {report.technicalQuestions?.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === "behavioral" && (
                            <section>
                                <div className="content-header">
                                    <h2>Behavioral Questions</h2>
                                    <span className="content-header__count">
                                        {report.behavioralQuestions?.length || 0} questions
                                    </span>
                                </div>
                                <div className="q-list">
                                    {report.behavioralQuestions?.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeNav === "roadmap" && (
                            <section>
                                <div className="content-header">
                                    <h2>Preparation Road Map</h2>
                                    <span className="content-header__count">
                                        {report.preparationPlan?.length || 0}-day plan
                                    </span>
                                </div>
                                <div className="roadmap-list">
                                    {report.preparationPlan?.map((day) => (
                                        <RoadMapDay key={day.day} day={day} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    <div className="interview-divider" />

                    {/* ── Right Sidebar ── */}
                    <aside className="interview-sidebar">
                        {/* Match Score */}
                        <div className="match-score">
                            <p className="match-score__label">Candidate Match Score</p>
                            <div className={`match-score__ring ${scoreColor}`}>
                                <span className="match-score__value">
                                    {report.matchScore}
                                </span>
                                <span className="match-score__pct">%</span>
                            </div>
                            <p className={`match-score__sub ${scoreColor}`}>
                                {scoreLabel}
                            </p>
                        </div>

                        <div className="sidebar-divider" />

                        {/* Skill Gaps */}
                        <div className="skill-gaps">
                            <div className="skill-gaps__header">
                                <p className="skill-gaps__label">Identified Skill Gaps</p>
                                <span className="skill-count">
                                    {report.skillGaps?.length || 0}
                                </span>
                            </div>
                            <div className="skill-gaps__list">
                                {report.skillGaps && report.skillGaps.length > 0 ? (
                                    report.skillGaps.map((gap, i) => (
                                        <div
                                            key={i}
                                            className={`skill-tag skill-tag--${gap.severity}`}
                                        >
                                            <span className="gap-name">{gap.skill}</span>
                                            <span className="gap-severity">
                                                {gap.severity}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-gaps">No major skill gaps identified!</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Interview;
