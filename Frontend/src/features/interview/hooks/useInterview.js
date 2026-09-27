import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
    deleteInterviewReportById,
} from "../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error(
            "useInterview must be used within an InterviewProvider",
        );
    }

    const {
        loading,
        setLoading,
        generating,
        setGenerating,
        downloadingPdf,
        setDownloadingPdf,
        report,
        setReport,
        reports,
        setReports,
        error,
        setError,
    } = context;

    const generateReport = async ({
        jobDescription,
        selfDescription,
        resumeFile,
    }) => {
        setGenerating(true);
        setError(null);
        try {
            const response = await generateInterviewReport({
                jobDescription,
                selfDescription,
                resumeFile,
            });
            if (response?.interviewReport) {
                setReport(response.interviewReport);
                setReports((prev) => [response.interviewReport, ...(prev || [])]);
                return response.interviewReport;
            }
            throw new Error("No report returned by AI engine.");
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Failed to generate interview report.";
            setError(msg);
            throw new Error(msg);
        } finally {
            setGenerating(false);
        }
    };

    const getReportById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInterviewReportById(id);
            setReport(response?.interviewReport || null);
            return response?.interviewReport;
        } catch (err) {
            console.error("Error fetching report:", err);
            setReport(null);
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch interview report.";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);
        try {
            const response = await getAllInterviewReports();
            setReports(response?.interviewReports || []);
            return response?.interviewReports;
        } catch (err) {
            console.error("Error fetching reports list:", err);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (id) => {
        try {
            await deleteInterviewReportById(id);
            setReports((prev) => (prev || []).filter((r) => r._id !== id));
            if (report?._id === id) {
                setReport(null);
            }
            return true;
        } catch (err) {
            console.error("Error deleting report:", err);
            let msg = err.message || "Failed to delete interview plan.";
            if (err.response?.data?.message) {
                msg = err.response.data.message;
            }
            throw new Error(msg);
        }
    };

    const getResumePdf = async (interviewReportId) => {
        setDownloadingPdf(true);
        try {
            const response = await generateResumePdf({ interviewReportId });
            if (response && response.type === "application/json") {
                const text = await response.text();
                const errJson = JSON.parse(text);
                throw new Error(errJson.message || "Failed to generate PDF");
            }
            const blob = new Blob([response], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Tailored_Resume_${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 2000);
        } catch (err) {
            console.error("PDF download error:", err);
            let msg = err.message || "Failed to generate tailored resume PDF.";
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    if (json.message) msg = json.message;
                } catch {}
            }
            throw new Error(msg);
        } finally {
            setDownloadingPdf(false);
        }
    };

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).catch(() => {});
        } else {
            getReports();
        }
    }, [interviewId]);

    return {
        loading,
        generating,
        downloadingPdf,
        report,
        reports,
        error,
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
        deleteReport,
    };
};
