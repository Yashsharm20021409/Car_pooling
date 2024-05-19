import "./activeRide.css";
import { React, useState, useEffect, useRef } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import {
  GoogleMap,
  DirectionsRenderer,
  DirectionsService,
  Marker,
} from "@react-google-maps/api";
// import Cookies from 'js-cookie';
import Geocode, { fromLatLng, setKey } from "react-geocode";
import { useLocation } from "react-router-dom";
import { useRideContext } from "../../RideContext";
import Footer from "../footer/Footer";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";

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

  const { rideInfo: rideInfo1 } = rideInfo;
  // console.log(rideInfo.rideInfo2);
  // console.log("rideId"+rideInfo.rideId)

  const getDateandTime = (dtString) => {
    const d = new Date(dtString);
    let date = d.toDateString();
    dtString = d.toTimeString();
    let time = dtString.split(" ")[0].split(":");
    return date + " @ " + time[0] + ":" + time[1];
  };
  // Active Trip details
  const [source, setsource] = useState("");
  const [destination, setdestination] = useState("");
  const [datetime, setdatetime] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await axios.get(
          `http://localhost:8000/api/trip/${rideInfo.rideId}`
        );

        // console.log(data.data.ride);
        setsource(data.data.ride.source);
        setdestination(data.data.ride.destination);
        setdatetime(getDateandTime(data.data.ride.dateTime));
        setPaid(data.data.ride.payment);
        setOrderId(data.data.ride._id);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTrip();

    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     // 'Coookie': Cookies.get('tokken')
    //   },
    // })
    //   .then((response) => {
    //     // console.log(response);
    //     if (response.ok) {
    //       return response.json();
    //     }

    //   })
    //   .then((responseJson) => {
    //     // console.log("AllData"+responseJson.ride);
    //     // setWaypointsFn(responseJson.waypoints)
    //     const length = responseJson.ride.length
    //     console.log(length)
    //     setsource(responseJson.ride[length-1].source);
    //     setdestination(responseJson.ride[length-1].destination);
    //     setdatetime(getDateandTime(responseJson.ride[length-1].dateTime));
    //     setPaid(responseJson.ride[length-1].payment);
    //     // console.log(responseJson.ride[length-1].payment)
    //     setOrderId(responseJson.ride[length-1]._id)
    //     // console.log("orderId"+orderId)
    //   })
    //   .catch((error) => {
    //     // alert(error);
    //     console.log(error);
    //   });
  }, [rideInfo.rideId]);

  // payment methods
  const KEY =
    "pk_test_51Mj5ZDSAj0EIjVubJGOehQ8kTZes4xSWiUFqZcWmBf3yFoOn7flyyqZJFt3WxqEKIF07jA7EvSGWh6zlCnteBGWY00EfjfQ4SS";
  const [stripeToken, setStripeToken] = useState(null);
  const [amountPaid, setPaid] = useState(false);

  const onToken = async (token) => {
    setStripeToken(token);
    try {
      // Send a POST request to your backend server to update payment status
      const response = await axios.post(
        `http://localhost:8000/api/trip/updatePayment/${orderId}`
      );
      console.log(response.data.message); // Log success message
      // Refresh the page after successful payment and update
      window.location.reload();
    } catch (error) {
      console.error(
        "Error updating payment status:",
        error.response.data.error
      ); // Log error message
      // Handle error as needed
    }
  };

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={center}
        options={options}
        onLoad={onMapLoad}
      ></GoogleMap>
      {rideInfo.rideId ? (
        <Container id="activeTripContainer" fluid="lg">
          <Row style={{ marginTop: "1rem" }}>
            <Col md="10">
              <h1 className="heading">Active Trip Details</h1>
              <Row>
                <h3 style={{ marginTop: "1rem" }}>
                  <span className="trip-attributes">Source</span>: {source}
                </h3>
                <h3>
                  <span className="trip-attributes">Destination</span>:{" "}
                  {destination}
                </h3>
                <h3>
                  <span className="trip-attributes">Date</span>: {datetime}
                </h3>
              </Row>
              <div className="payment">
                <div className="paymentDetails">
                  <h4>Amount To be Paid: {rideInfo.rideInfo2}</h4>
                </div>
                {amountPaid ? (
                  "Amount Paid"
                ) : (
                  <StripeCheckout
                    name="Yash Shop"
                    image="https://api.freelogodesign.org/assets/thumb/logo/6294672_400.png?t=637945524870000000"
                    billingAddress
                    shippingAddress
                    description={`Your Total Amout is INR ${rideInfo.rideInfo2}`}
                    amount={rideInfo.rideInfo2}
                    token={onToken}
                    stripeKey={KEY}
                  >
                    <Button>CheckOut</Button>
                  </StripeCheckout>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignContent: center,
            height: "220px",
          }}
        >
          <h2>No Active Trip</h2>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ActiveRide;
