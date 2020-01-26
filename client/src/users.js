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
  Input
} from "reactstrap";

import { useDataProvider, Loading } from "react-admin";

function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date
    .getDate()
    .toString()
    .padStart(2, "0");

  return month + "/" + day + "/" + year;
}

export const UserList = props => {
  const dataProvider = useDataProvider();
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    dataProvider
      .getUsers()
      .then(({ data }) => {
        setUsers(data);
      })
      .catch(e => setError(e));
    setLoading(false);
  }, [dataProvider]);

  if (loading) return <Loading />;
  if (error) return <h1>Error</h1>;
  if (!users) return null;
  return (
    <Container className="mt-4">
      <Button
        className="mb-2 float-right"
        onClick={() => props.history.push("/users/create")}
      >
        New
      </Button>
      <Table striped hover style={{ fontSize: "14px" }}>
        <thead>
          <tr>
            <th scope="col">account</th>
            <th scope="col" className="text-center">
              name
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, k) => {
            return (
              <tr key={k}>
                <td>{user.sender}</td>
                <td className="text-center">{user.name}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export const UserCreate = props => {
  const dataProvider = useDataProvider();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const onCreate = async () => {
    setLoading(true);
    if (name) {
      dataProvider
        .createUser(name)
        .then(res => {
          props.history.push("/users");
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
              <Label for="name">Name</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="User Name"
                onChange={e => setName(e.target.value)}
                value={name}
              />
            </Col>
          </Row>
          <br />
          <Button color="primary" onClick={onCreate}>
            Create User
          </Button>
        </FormGroup>
      </Form>
    </Container>
  );
};

export const ShowUser = props => {
  const dataProvider = useDataProvider();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    dataProvider
      .getUser(props.match.params.id)
      .then(({ data }) => {
        setUser(data);
        setLoading(false);
      })
      .catch(e => setError(e));
  }, [dataProvider, props.match.params.id]);

  if (error) return <h1>Error</h1>;
  if (loading) return <Loading />;

  return (
    <Container>
      <Form className="m-3" tag="h5">
        <FormGroup>
          <Row className="align-items-center" style={{ fontSize: "1rem" }}>
            <Col sm={3} xs={3}>
              <Label for="address">Address</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                plaintext
                readOnly
                type="text"
                name="address"
                id="address"
                value={user.account}
              />
            </Col>
          </Row>
          <Row className="align-items-center" style={{ fontSize: "1rem" }}>
            <Col sm={3} xs={3}>
              <Label for="name">Name</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                plaintext
                readOnly
                type="text"
                name="name"
                id="name"
                value={user.name}
              />
            </Col>
          </Row>
          <Row className="align-items-center" style={{ fontSize: "1rem" }}>
            <Col sm={3} xs={3}>
              <Label for="last">Last Report</Label>
            </Col>
            <Col sm={6} xs={8}>
              <Input
                plaintext
                readOnly
                type="text"
                name="last"
                id="last"
                value={getFormattedDate(new Date(user.lastReport * 1000))}
              />
            </Col>
          </Row>

          <br />
        </FormGroup>
      </Form>
    </Container>
  );
};
