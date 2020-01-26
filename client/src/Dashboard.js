import React, { useEffect, useState } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import { Loading, Error } from "react-admin";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Label,
  Input,
  Container,
  Form,
  FormGroup
} from "reactstrap";

export default ({ account, contract }) => {
  const [balance, setBalance] = useState(0);
  const [amountDeposit, setAmountDeposit] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [delay, setDelay] = useState(0);
  const [fee, setFee] = useState(0);
  const [admin, setAdmin] = useState("");
  const [unit, setUnit] = useState("Seconds");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const user = await contract.methods.users(account).call();
        setBalance(window.web3.utils.fromWei(user.balance));

        const currentFee = await contract.methods.delayFee().call();
        setFee(window.web3.utils.fromWei(currentFee));

        const currentDelay = await contract.methods.maxDelay().call();
        setDelay(currentDelay);

        const currentAdmin = await contract.methods.admin().call();
        setAdmin(currentAdmin);
      } catch (e) {
        console.log(e);
        setError(e);
      }

      setLoading(false);
    };
    if (contract) {
      getData();
    }
  }, [contract, account, modalOpen]);

  const handleSettings = async () => {
    let newDelay;
    setLoading(true);

    switch (unit) {
      case "Days":
        newDelay = delay * 24 * 60 * 60;
        break;
      case "Hours":
        newDelay = delay * 60 * 60;
        break;

      case "Minutes":
        newDelay = delay * 60;
        break;
      case "Seconds":
        newDelay = delay;
        break;
      default:
        break;
    }

    await contract.methods
      .updateMaxDealy(newDelay)
      .send({ from: window.ethereum.selectedAddress });

    setLoading(false);
  };

  const handleFee = async () => {
    setLoading(true);
    await contract.methods
      .updateFee(fee)
      .send({ from: window.ethereum.selectedAddress });

    setLoading(false);
  };

  const handleAdmin = async () => {
    setLoading(true);
    await contract.methods
      .changeAdmin(admin)
      .send({ from: window.ethereum.selectedAddress });

    setLoading(false);
  };

  const deposit = async () => {
    setLoading(true);
    contract.methods
      .deposit()
      .send({
        from: account,
        value: window.web3.utils.toWei(String(amountDeposit))
      })
      .then(res => {
        console.log(res);
        setLoading(false);
        setModalOpen(false);
      })
      .catch(e => {
        setLoading(false);
        console.log(e);
        setError(e);
      });
  };

  if (loading) return <Loading />;
  // if (error) return <h2 className="p-5"> Something Went Wrong...</h2>;
  if (error) return <Error />;

  return (
    <>
      <Card>
        <CardHeader title="Welcome to the administration" />
        <CardContent>
          <h3 className="mb-3">Balance: {balance} ETH</h3>
          <Button onClick={() => setModalOpen(true)}>Deposit</Button>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardHeader title="Max Delay" />
        <CardContent>
          <Container>
            <Form className="m-3" tag="h5">
              <FormGroup>
                <Row className="align-items-center">
                  <Col sm={3} xs={3}>
                    <Label for="time_unit">Time Unit</Label>
                  </Col>
                  <Col sm={6} xs={8}>
                    <Input
                      type="select"
                      name="time_unit"
                      id="time_unit"
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                    >
                      <option>Seconds</option>
                      <option>Minutes</option>
                      <option>Hours</option>
                      <option>Days</option>
                    </Input>
                  </Col>
                </Row>
                <Row className="align-items-center">
                  <Col sm={3} xs={3}>
                    <Label for="time_value">Value</Label>
                  </Col>
                  <Col sm={6} xs={8}>
                    <Input
                      type="number"
                      name="time_value"
                      id="time_value"
                      placeholder="Enter Value according to unit"
                      onChange={e => setDelay(e.target.value)}
                      value={delay}
                    />
                  </Col>
                </Row>

                <br />
                <Button color="primary" onClick={handleSettings}>
                  Update
                </Button>
              </FormGroup>
            </Form>
          </Container>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardHeader title="Delay Fee" />
        <CardContent>
          <Container>
            <Form className="m-3" tag="h5">
              <FormGroup>
                <Row className="align-items-center">
                  <Col sm={3} xs={3}>
                    <Label for="fee">Fee (ether)</Label>
                  </Col>
                  <Col sm={6} xs={8}>
                    <Input
                      type="number"
                      name="fee"
                      id="fee"
                      placeholder="Enter Delay Fee amount in Ether"
                      onChange={e => setFee(e.target.value)}
                      value={fee}
                    />
                  </Col>
                </Row>

                <br />
                <Button color="primary" onClick={handleFee}>
                  Update
                </Button>
              </FormGroup>
            </Form>
          </Container>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardHeader title="Contract Admin" />
        <CardContent>
          <Container>
            <Form className="m-3" tag="h5">
              <FormGroup>
                <Row className="align-items-center">
                  <Col sm={3} xs={3}>
                    <Label for="admin">Admin</Label>
                  </Col>
                  <Col sm={6} xs={8}>
                    <Input
                      type="text"
                      name="admin"
                      id="admin"
                      placeholder="Enter new contract admin address"
                      onChange={e => setAdmin(e.target.value)}
                      value={admin}
                    />
                  </Col>
                </Row>

                <br />
                <Button color="primary" onClick={handleAdmin}>
                  Update
                </Button>
              </FormGroup>
            </Form>
          </Container>
        </CardContent>
      </Card>

      {modalOpen && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            Amount to Deposit
          </ModalHeader>
          <ModalBody>
            <Row className="align-items-center">
              <Col sm={3} xs={3}>
                <Label for="hardness">Amount</Label>
              </Col>
              <Col sm={6} xs={8}>
                <Input
                  type="number"
                  name="deposit"
                  id="deposit"
                  placeholder="Enter deposit in Ether"
                  onChange={e => setAmountDeposit(e.target.value)}
                  value={amountDeposit}
                />
              </Col>
            </Row>
            <ModalFooter className="text-center">
              <Button color="primary" onClick={() => deposit()}>
                OK
              </Button>{" "}
              <Button color="secondary" onClick={() => setModalOpen(false)}>
                CANCEL
              </Button>
            </ModalFooter>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};
