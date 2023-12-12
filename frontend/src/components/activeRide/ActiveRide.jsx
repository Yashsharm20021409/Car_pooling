
import "./activeRide.css"
import { React, useState, useEffect, useRef } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { GoogleMap, DirectionsRenderer, DirectionsService, Marker } from '@react-google-maps/api';
// import Cookies from 'js-cookie';
import Geocode, { fromLatLng, setKey } from "react-geocode";
import { useLocation } from "react-router-dom";
import { useRideContext } from '../../RideContext';
import Footer from "../footer/Footer"


setKey("AIzaSyDzHhUntfNJsOCijbQhPiXEvuih17_fE3U")
// Map options

const mapContainerStyle = {
  height: "35vh",
  width: "100%",
};
const options = {
  disableDefaultUI: true,
  zoomControl: true,
};
const center = {
  lat: 43.473078230478336,
  lng: -80.54225947407059,
};


const ActiveRide = () => {

  const mapRef = useRef();
  const onMapLoad = (map) => {
    mapRef.current = map;
  };
  
  const { rideInfo } = useRideContext();

  const {rideInfo1} = rideInfo;

  const getDateandTime = (dtString) => {
    const d = new Date(dtString);
    let date = d.toDateString();
    dtString = d.toTimeString();
    let time = dtString.split(' ')[0].split(':')
    return date + ' @ ' + time[0] + ':' + time[1]
  }
  // Active Trip details
  const [source, setsource] = useState("")
  const [destination, setdestination] = useState("")
  const [datetime, setdatetime] = useState("")


  useEffect(() => {
    fetch(`http://localhost:8000/api/trip/${rideInfo1}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Coookie': Cookies.get('tokken')
      }
    }).then((response) => {
      console.log(response)
      if (response.ok) {
        return response.json();
      }
    }).then((responseJson) => {
      console.log(responseJson)
      // setWaypointsFn(responseJson.waypoints)
      setsource(responseJson.ride[0].source)
      setdestination(responseJson.ride[0].destination)
      setdatetime(getDateandTime(responseJson.ride[0].dateTime))

    }).catch((error) => {
      // alert(error);
      console.log(error)
    });
  }, [rideInfo1]);



  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={options}
        onLoad={onMapLoad}>
      </GoogleMap>
      <Container id="activeTripContainer" fluid="lg">
        <Row style={{ marginTop: '1rem' }}>
          <Col md="10">
            <h1 className="heading">Active Trip Details</h1>
            <Row>
              <h3 style={{ marginTop: '1rem' }}><span className='trip-attributes'>Source</span>: {source}</h3>
              <h3><span className='trip-attributes'>Destination</span>: {destination}</h3>
              <h3><span className='trip-attributes'>Date</span>: {datetime}</h3>
            </Row>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  )
}

export default ActiveRide