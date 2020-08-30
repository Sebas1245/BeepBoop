import React from 'react';
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import axios from 'axios';
import Webcam from 'webcam-easy';

class App extends React.Component {
  state = {
    photoUrl: '',
    brandInfo: {
      Short_company_name: '',
      Overall_Score: '',
      ETHIC_SCORE:'',
    },
  }
  webcam = {};
  handleChange = (e) => {
    this.setState({
        [e.target.id]: e.target.value
    })
  }
  takePicture = () => {
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'user', canvasElement);
    let picture = webcam.snap()
    console.log(picture);
    this.setState({
      photoUrl: picture
    })
    console.log(this.state.photoUrl);
  }
  handleSubmit = (e) => {
    e.preventDefault()
    const imageUrl = this.state.photoUrl
    axios({
      method: "POST",
      url: "http://localhost:5000/detect_brand",
      data: {imageUrl},

    })
    .then(res => {
      if(res.data.msg === 'success'){
        //show card with brand data
        console.log(res.data.msg);
        this.setState({
          brandInfo: res.data.info[0]
        })
      }
    })
    .catch(err => {
      alert(err);
    })
  }
  componentDidMount() {
    const webcamElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('canvas');
    const webcam = new Webcam(webcamElement, 'user', canvasElement);
    webcam.start()
    .then(result => {
        console.log("webcam started");
        console.log(webcam);
    })
    .catch(err => {
        console.log(err);
    })
  }
  render() {
      return (
      <div className="App">
        <Container fluid>
          <Row>
            <h1 className="text-center">Welcome to BeepBoop!</h1>
          </Row>
          <Row className="justify-content-center">
            <Col xs={8}>
              <Card className="p-3">
                <Card.Body>
                  <Card.Title>Calculate the Ethical Implications of a Product</Card.Title>
                    <Form onSubmit={this.handleSubmit}>
                      <Form.Group>
                      <Form.Label>Submit a Photo URL:</Form.Label>
                      <Form.Control id="photoUrl" type="text" placeholder="Enter image URL" value={this.state.photoUrl} onChange={this.handleChange}>
                      </Form.Control>
                      </Form.Group>
                      <Button className="m-4" variant="primary" type="submit">
                        Submit
                      </Button>
                    </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        
        <Container fluid className="mt-5">
          <Row className="justify-content-center">
            <Col xs={6}>
                <Row className="justify-content-center">
                  <Button onClick={this.takePicture}>Take picture!</Button>
                </Row>
                <Row className="justify-content-center">
                  <video id="webcam" autoplay playsinline width="540" height="480"></video>
                  <canvas id="canvas" class="d-none"></canvas>
                </Row>
            </Col>
            <Col xs={6}>
            <div id="brandInfoCard">
                <Card>
                  <Card.Title className="text-center mt-5">Ratings for {this.state.brandInfo.Short_company_name}</Card.Title>
                  <Card.Body>  
                    <ListGroup as="ul">
                      <ListGroup.Item as="li">
                        <span className="font-weight-bold">Overall_Score - </span><span className="font-weight-bold">{this.state.brandInfo.Overall_Score}</span>
                      </ListGroup.Item>
                      <ListGroup.Item as="li">
                        <span className="font-weight-bold">Ethics score: </span> {this.state.brandInfo.ETHIC_SCORE}
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>

      </div>
    );
  }
}

export default App;
