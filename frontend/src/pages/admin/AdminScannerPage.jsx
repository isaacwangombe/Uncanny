import React, { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { adminVerifyTicket } from "../../apiAdmin"; // ✅ FIXED

const AdminScannerPage = () => {
  const [result, setResult] = useState("");
  const [resultType, setResultType] = useState(""); // success | warning | error | neutral
  const [error, setError] = useState("");

  // -------------------------------
  // Process scanned UUID
  // -------------------------------
  const handleScan = async (decodedText) => {
    console.log("🔍 RAW SCAN:", decodedText);

    // Extract UUID
    const uuidMatch = decodedText.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    );

    if (!uuidMatch) {
      setResultType("error");
      setResult("❌ Invalid QR format");
      return;
    }

    const uuid = uuidMatch[0];
    console.log("🎯 EXTRACTED UUID:", uuid);

    setResultType("neutral");
    setResult("⏳ Verifying…");

    try {
      const res = await adminVerifyTicket(uuid); // ✅ FIXED API CALL

      setResultType("success");
      setResult(`🎉 VALID — ${res.event}`);
    } catch (err) {
      console.error("VERIFY ERROR:", err);

      // Extract status
      const message = err?.message || "";
      const statusMatch = message.match(/\((\d{3})\)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : null;

      // Extract JSON detail
      let detail = null;
      const jsonMatch = message.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          detail = JSON.parse(jsonMatch[0]).detail;
        } catch {}
      }

      if (detail === "Already used") {
        setResultType("warning");
        setResult("⚠️ Ticket already used");
      } else if (detail === "Invalid ticket") {
        setResultType("error");
        setResult("❌ Invalid ticket");
      } else if (status === 400) {
        setResultType("warning");
        setResult("⚠️ Ticket already used (400)");
      } else if (status === 404) {
        setResultType("error");
        setResult("❌ Invalid ticket (404)");
      } else {
        setResultType("error");
        setResult("❌ Unexpected error");
      }
    }
  };

  // -------------------------------
  // Start scanner on load
  // -------------------------------
  useEffect(() => {
    let html5qr = null;
    let busy = false;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setError("❌ No camera found");
          return;
        }

        html5qr = new Html5Qrcode("qr-reader");
        const camId = cameras[0].id;

        html5qr.start(
          camId,
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (busy) return;
            busy = true;

            try {
              if (html5qr.stop) await html5qr.stop();
            } catch {}

            try {
              if (html5qr.clear) await html5qr.clear();
            } catch {}

            await handleScan(decodedText);
          },
          () => {}
        );
      } catch (e) {
        console.error(e);
        setError("Camera access denied or unavailable");
      }
    };

    startScanner();

    return () => {
      if (html5qr) {
        try {
          if (html5qr.stop) html5qr.stop();
        } catch {}
        try {
          if (html5qr.clear) html5qr.clear();
        } catch {}
      }
    };
  }, []);

  // Apple-style result box colors
  const resultClass =
    resultType === "success"
      ? "bg-success text-white"
      : resultType === "warning"
      ? "bg-warning"
      : resultType === "error"
      ? "bg-danger text-white"
      : "bg-light";

  return (
    <div className="container-fluid py-3 py-md-5">
      <div
        className="card mx-auto"
        style={{
          borderRadius: "20px",
          padding: "20px",
          maxWidth: "500px",
        }}
      >
        <h2
          className="text-center mb-3 mb-md-4"
          style={{
            fontWeight: "700",
            fontSize: "22px",
          }}
        >
          🎫 Ticket Scanner
        </h2>

        {/* QR Scanner */}
        <div
          id="qr-reader"
          style={{
            width: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            minHeight: "260px",
          }}
        />

        {error && (
          <p className="text-danger mt-3 text-center fw-semibold">{error}</p>
        )}

        {result && (
          <div
            className={`mt-3 p-3 text-center fw-semibold ${resultClass}`}
            style={{
              borderRadius: "14px",
              fontSize: "15px",
            }}
          >
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScannerPage;
