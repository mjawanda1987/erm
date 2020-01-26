import React, { useEffect, useState } from "react";

import {
  Button,
  Container,
  Table,
  Form,
  FormGroup,
  Row,
  Col,
  Label,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter
} from "reactstrap";

import { useDataProvider, Loading, Error } from "react-admin";

function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date
    .getDate()
    .toString()
    .padStart(2, "0");

  return month + "/" + day + "/" + year;
}

export const ReportList = props => {
  const dataProvider = useDataProvider();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    dataProvider
      .getReports()
      .then(({ data }) => {
        setReports(data);
      })
      .catch(e => setError(e));
    setLoading(false);
  }, [dataProvider]);

  const onDelete = async () => {
    setLoading(true);
    setModalOpen(false);
    if (toDelete) {
      dataProvider
        .removeReport(toDelete)
        .then(res => {
          setLoading(false);
        })
        .catch(e => {
          setError(e);
          setLoading(false);
        });
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!reports) return null;
  return (
    <Container className="mt-4">
      <Button
        className="mb-2 float-right"
        onClick={() => props.history.push("/reports/create")}
      >
        New
      </Button>
      <Table striped hover style={{ fontSize: "14px" }}>
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Issuer</th>
            <th scope="col">pH</th>
            <th scope="col">Hardness</th>
            <th scope="col">TDS</th>
            <th scope="col">Company</th>
            <th scope="col">Date</th>
            <th scope="col">Signed</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, k) => {
            return (
              <tr key={k}>
                <td
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => props.history.push(`/reports/${report.key}`)}
                >
                  <u>{report.key.slice(0, 8)}</u>
                </td>
                <td
                  style={{ color: "blue", cursor: "pointer" }}
                  onClick={() => props.history.push(`/users/${report.sender}`)}
                >
                  <u>{report.sender.slice(0, 8)}</u>
                </td>
                <td>{report.ph}</td>
                <td>{report.hardness}</td>
                <td>{report.tds}</td>
                <td>{report.companyName}</td>
                <td>{getFormattedDate(new Date(report.timestamp * 1000))}</td>
                <td>{report.signed ? "true" : "false"}</td>
                <td>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => {
                      setToDelete(report.key);
                      setModalOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {modalOpen && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            Confirmation
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this report?</p>
            <ModalFooter className="text-center">
              <Button color="primary" onClick={() => onDelete()}>
                YES
              </Button>{" "}
              <Button color="secondary" onClick={() => setModalOpen(false)}>
                NO
              </Button>
            </ModalFooter>
          </ModalBody>
        </Modal>
      )}
    </Container>
  );
};

export const NewReport = props => {
  const dataProvider = useDataProvider();
  const [report, setReport] = useState({ signed: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const onCreate = async () => {
    setLoading(true);
    if (report) {
      dataProvider
        .newReport(report)
        .then(res => {
          props.history.push("/reports");
        })
        .catch(e => setError(e));
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <h1>Error</h1>;

  return (
    <Container>
      <Form className="m-3" tag="h5">
        <FormGroup>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="ph">pH</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                type="number"
                name="ph"
                id="ph"
                placeholder="pH"
                onChange={e => setReport({ ...report, ph: e.target.value })}
                value={report.ph || ""}
              />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="hardness">Hardness</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                type="number"
                name="hardness"
                id="hardness"
                placeholder="hardness"
                onChange={e =>
                  setReport({ ...report, hardness: e.target.value })
                }
                value={report.hardness || ""}
              />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="tds">TDS</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                type="number"
                name="tds"
                id="tds"
                placeholder="tds"
                onChange={e => setReport({ ...report, tds: e.target.value })}
                value={report.tds || ""}
              />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="companyName">Company Name</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                type="text"
                name="companyName"
                id="companyName"
                placeholder="Name of Company"
                onChange={e =>
                  setReport({ ...report, companyName: e.target.value })
                }
                value={report.companyName || ""}
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col sm={3} xs={3}>
              <Label for="signed">Signed</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                className="ml-2"
                type="checkbox"
                name="signed"
                id="signed"
                checked={report.signed}
                onChange={e =>
                  setReport({ ...report, signed: e.target.checked })
                }
              />
            </Col>
          </Row>
          <br />
          <Button color="primary" onClick={onCreate}>
            Create Report
          </Button>
        </FormGroup>
      </Form>
    </Container>
  );
};

export const EditReport = props => {
  const dataProvider = useDataProvider();
  const [report, setReport] = useState({ signed: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    dataProvider
      .getReport(props.match.params.id)
      .then(({ data }) => {
        data.key = props.match.params.id;
        setReport(data);
        setLoading(false);
      })
      .catch(e => setError(e));
  }, [dataProvider, props.match.params.id]);

  const onEdit = async () => {
    setLoading(true);

    if (report) {
      console.log(report);
      dataProvider
        .updateReport(report)
        .then(res => {
          props.history.push("/reports");
        })
        .catch(e => setError(e));
      setLoading(false);
    }
  };

  if (error) return <h1>Error</h1>;
  if (loading) return <Loading />;

  return (
    <Container>
      <Form className="m-3" tag="h5">
        <FormGroup>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="ph">pH</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                readOnly
                type="number"
                name="ph"
                id="ph"
                placeholder="pH"
                value={report.ph || ""}
              />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="hardness">Hardness</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                readOnly
                type="number"
                name="hardness"
                id="hardness"
                value={report.hardness || ""}
              />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="tds">TDS</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                readOnly
                type="number"
                name="tds"
                id="tds"
                value={report.tds || ""}
              />
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col sm={3} xs={3}>
              <Label for="company">Company Name</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                readOnly
                type="text"
                name="company"
                id="company"
                value={report.companyName || ""}
              />
            </Col>
          </Row>
          <Row className="mt-2">
            <Col sm={3} xs={3}>
              <Label for="signed">Signed</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                className="ml-2"
                type="checkbox"
                name="signed"
                id="signed"
                checked={report.signed}
                onChange={e =>
                  setReport({ ...report, signed: e.target.checked })
                }
              />
            </Col>
          </Row>

          <br />
          <Button color="primary" onClick={onEdit}>
            Update Report
          </Button>
        </FormGroup>
      </Form>
    </Container>
  );
};
