import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const EmailBlastModal = ({ show, onHide, onSend, selectedEmails = [] }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !body) return alert("Please fill in all fields.");
    setSending(true);

    await onSend(subject, body, selectedEmails);

    setSending(false);
    setSubject("");
    setBody("");
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Email Blast</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted">
          Sending to <strong>{selectedEmails.length}</strong> recipients.
        </p>

        <Form.Group className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Message Body</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email…"
            required
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={sending}>
          {sending ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Sending...
            </>
          ) : (
            "Send Email Blast"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmailBlastModal;
