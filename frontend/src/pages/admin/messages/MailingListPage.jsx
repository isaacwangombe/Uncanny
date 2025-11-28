import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Row,
  Col,
  Form,
  Spinner,
  Pagination,
  Button,
} from "react-bootstrap";
import {
  adminGetMailingList,
  adminEmailBlast,
  adminDeleteSubscriber,
} from "../../../apiAdmin";
import EmailBlastModal from "./EmailBlastModal";

const MailingListPage = () => {
  const [subs, setSubs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Email blast state
  const [blastOpen, setBlastOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Select-all states
  const [selectAllPage, setSelectAllPage] = useState(false);
  const [selectAllGlobal, setSelectAllGlobal] = useState(false);

  // Load mailing list
  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    setLoading(true);
    try {
      const data = await adminGetMailingList();
      setSubs(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to load list:", err);
    }
    setLoading(false);
  };

  // Search filter
  useEffect(() => {
    const f = subs.filter((s) =>
      `${s.first_name} ${s.last_name} ${s.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(f);
    setPage(1);
    setSelectAllPage(false);
  }, [search, subs]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Toggle individual email selection
  const toggleEmail = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  // Select all on current page
  const toggleSelectAllPage = () => {
    const pageEmails = paginated.map((s) => s.email);

    if (selectAllPage) {
      setSelectedEmails((prev) => prev.filter((e) => !pageEmails.includes(e)));
      setSelectAllPage(false);
    } else {
      setSelectedEmails((prev) => [...new Set([...prev, ...pageEmails])]);
      setSelectAllPage(true);
    }

    setSelectAllGlobal(false);
  };

  // Select all subscribers (entire filtered list)
  const toggleSelectAllGlobal = () => {
    if (selectAllGlobal) {
      setSelectedEmails([]);
      setSelectAllGlobal(false);
      setSelectAllPage(false);
    } else {
      const allEmails = filtered.map((s) => s.email);
      setSelectedEmails(allEmails);
      setSelectAllGlobal(true);
      setSelectAllPage(true);
    }
  };

  const handleBlastSend = async (subject, body, emails) => {
    await adminEmailBlast(subject, body, emails);
    alert("Email blast sent!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this subscriber?")) return;
    await adminDeleteSubscriber(id);
    loadSubs();
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h4>Mailing List</h4>
        </Col>

        <Col className="text-end">
          <Button
            variant="primary"
            disabled={selectedEmails.length === 0}
            onClick={() => setBlastOpen(true)}
          >
            Email Blast ({selectedEmails.length})
          </Button>
        </Col>
      </Row>

      <Row className="mb-3 align-items-center g-2">
        <Col xs={12} md={4}>
          <Form.Control
            placeholder="Search mailing list…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col xs={12} md={8} className="text-md-end">
          <Form.Check
            inline
            type="checkbox"
            label="Select all (this page)"
            checked={selectAllPage}
            onChange={toggleSelectAllPage}
          />
          <Form.Check
            inline
            type="checkbox"
            label="Select all (entire list)"
            checked={selectAllGlobal}
            onChange={toggleSelectAllGlobal}
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive className="align-middle text-nowrap">
          <thead>
            <tr>
              <th>Select</th>
              <th>Email</th>
              <th>Name</th>
              <th>Subscribed At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((s) => (
              <tr key={s.id}>
                <td>
                  <Form.Check
                    checked={selectedEmails.includes(s.email)}
                    onChange={() => toggleEmail(s.email)}
                  />
                </td>

                <td>{s.email}</td>

                <td>{(s.first_name || "") + " " + (s.last_name || "")}</td>

                <td>{new Date(s.subscribed_at).toLocaleString()}</td>

                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(s.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + 1 === page}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      <EmailBlastModal
        show={blastOpen}
        onHide={() => setBlastOpen(false)}
        onSend={handleBlastSend}
        selectedEmails={selectedEmails}
      />
    </Container>
  );
};

export default MailingListPage;
