import React, { useEffect, useState } from "react";
import { Button, Form, Table, Modal, Spinner } from "react-bootstrap";
import { adminGetMessages, adminReplyToMessage } from "../../../apiAdmin"; // ⬅ NEW clean API

const MessagesAdminPage = () => {
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [groupByEmail, setGroupByEmail] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);

  // Reply modal
  const [showReply, setShowReply] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Load messages
  async function load() {
    setLoading(true);
    try {
      const data = await adminGetMessages();

      const normalized = (data || []).map((m) => ({
        ...m,
        created_at:
          m.created_at && !isNaN(Date.parse(m.created_at))
            ? m.created_at
            : new Date().toISOString(),
      }));

      setMessages(normalized);
      setFiltered(normalized);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Filtering logic
  useEffect(() => {
    let result = [...messages];

    // Search filter
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      result = result.filter(
        (m) =>
          (m.email || "").toLowerCase().includes(s) ||
          (m.first_name || "").toLowerCase().includes(s) ||
          (m.last_name || "").toLowerCase().includes(s) ||
          (m.message || "").toLowerCase().includes(s)
      );
    }

    // Date filters
    if (startDate) {
      const sd = new Date(startDate + "T00:00:00Z");
      result = result.filter((m) => new Date(m.created_at) >= sd);
    }

    if (endDate) {
      const ed = new Date(endDate + "T23:59:59Z");
      result = result.filter((m) => new Date(m.created_at) <= ed);
    }

    // Group by email (newest message)
    if (groupByEmail) {
      const byEmail = new Map();
      result.forEach((m) => {
        const key = m.email || `id-${m.id}`;
        const existing = byEmail.get(key);

        if (
          !existing ||
          new Date(m.created_at) > new Date(existing.created_at)
        ) {
          byEmail.set(key, m);
        }
      });
      result = Array.from(byEmail.values());
    }

    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setFiltered(result);
  }, [search, startDate, endDate, groupByEmail, messages]);

  // Reply actions
  const handleReply = (msg) => {
    setActiveMessage(msg);
    setReplyBody("");
    setShowReply(true);
  };

  const sendReply = async () => {
    if (!activeMessage) return;
    setSendingReply(true);

    try {
      await adminReplyToMessage(activeMessage.id, replyBody);

      // Update only that message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === activeMessage.id ? { ...m, replied: true } : m
        )
      );

      setShowReply(false);
      setReplyBody("");
      alert("Reply sent successfully!");
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="fw-bold mb-4">📩 Contact Messages</h2>

      {/* Filters */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Form.Control
          placeholder="Search email, name or message..."
          style={{ width: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Form.Control
          type="date"
          style={{ width: 180 }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <Form.Control
          type="date"
          style={{ width: 180 }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Form.Check
          type="switch"
          label="Group by email"
          checked={groupByEmail}
          onChange={() => setGroupByEmail(!groupByEmail)}
        />

        <Button variant="outline-secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-4 text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th style={{ minWidth: 320 }}>Message</th>
              <th>Subscribed</th>
              <th>Replied</th>
              <th style={{ minWidth: 160 }}>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>{m.email}</td>
                <td>{`${m.first_name || ""} ${m.last_name || ""}`}</td>
                <td style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>
                  {m.message}
                </td>
                <td>{m.subscribed ? "✔" : "—"}</td>
                <td>{m.replied ? "✔" : "—"}</td>

                <td>
                  {new Date(m.created_at).toLocaleString() || "Unknown date"}
                </td>

                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReply(m)}
                  >
                    Reply
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Reply Modal */}
      <Modal show={showReply} onHide={() => setShowReply(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to {activeMessage?.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={8}
            placeholder="Write your reply…"
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReply(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={sendReply}
            disabled={sendingReply || !replyBody.trim()}
          >
            {sendingReply ? "Sending…" : "Send Reply"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MessagesAdminPage;
