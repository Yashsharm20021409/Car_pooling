import { React, useEffect, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap'
import * as GrIcons from 'react-icons/gr'
import sourceImg from '../../start-location.svg';
import destinationImg from '../../pin-location.svg';
import dtImg from '../../date-and-time.svg';
import groupImg from '../../group.svg';
import './getRide.css';
import Cookies from 'js-cookie';
// import Geocode, { fromLatLng } from "react-geocode";
import axios from 'axios'
import { Navigate, useNavigate } from "react-router-dom";

import { useRideContext } from '../../RideContext';

export default function GetRide() {
    const divRef = useRef(null)
    const [dataObject1, setDataObject] = useState({});
    const navigate = useNavigate();
    const { setRideDetails } = useRideContext();

    const getLocFromCoords = async (coords) => {
        let lat = coords['lat']
        let long = coords['lng']

        // console.log(lat,long)

        const res = await axios.get(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`)
        const location = await res?.data?.display_name;
        // console.log(location)
        return location.slice(0, 45) + '...'
    }

    const getDateandTime = (dtString) => {
        const d = new Date(dtString);
        let date = d.toDateString();
        dtString = d.toTimeString();
        let time = dtString.split(' ')[0].split(':')
        return date + ' @ ' + time[0] + ':' + time[1]
    }

    const [tripDetails, setTripDetails] = useState([])
    const fetchData = async () => {
        const response = await fetch('http://localhost:8000/api/trip/allRide', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            }
        })
        const rides = await response.json()

        // Parse Data
        // console.log(rides?.allRide)
        const data = rides?.allRide;
        let tempArray = []
        for (let i = 0; i < data?.length; i++) {
            let thisTrip = data[i]
            let newTrip = {}
            let loc;
            loc = await getLocFromCoords(thisTrip["source"])
            newTrip["source"] = loc
            loc = await getLocFromCoords(thisTrip["destination"])
            newTrip["destination"] = loc
            newTrip["tripDate"] = getDateandTime(thisTrip["dateTime"])
            newTrip["riderCount"] = thisTrip["riders"].length
            newTrip["completed"] = thisTrip["completed"]
            newTrip['rideId'] = thisTrip["_id"]

            console.log(newTrip)
            tempArray.push(newTrip)
        }
        setTripDetails(tempArray)
        // console.log("Temp"+tempArray)
    }

    useEffect(() => {
        fetchData()
    }, [])


    const bookRide = async () => {

        if (divRef.current) {
            const sourceElement = divRef.current.querySelector('.source-info');
            const destinationElement = divRef.current.querySelector('.destination-info');
            const dateElement = divRef.current.querySelector('.date-info');
            const rideElement = divRef.current.querySelector('.ride-info');

            const sourceInfo = sourceElement ? sourceElement.textContent : 'N/A';
            const destinationInfo = destinationElement ? destinationElement.textContent : 'N/A';
            const dateInfo = dateElement ? dateElement.textContent : 'N/A';
            const rideInfo1 = rideElement ? rideElement.textContent : "N/A";

            const rideInfo = {
                source: sourceInfo,
                destination: destinationInfo,
                date: dateInfo,
                rideId:rideInfo1
            };

            return fetch("http://localhost:8000/api/trip/bookRide", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + Cookies.get('tokken'),  //another working solution
                    'Coookie': Cookies.get('tokken')
                },
                body: JSON.stringify(rideInfo)

            }).then((response) => {
                if (response.ok)
                    return response.json();
                else if (response.status === 401)
                    // setToken(null);
                throw new Error(response.statusText);
            }).then((responseJson) => {
                setRideDetails({rideInfo1})
                navigate("/active-ride")
            }).catch((error) => {
                console.log(error);
                alert(error);
                // window.location.reload();
            });
        }
    }


    const CardView = ({
        source = "Default Title",
        destination = "Default Text",
        tripDate = "defaultDate",
        rideID ,

    }) => (
        <div className="card-body mb-4 mt-4 mx-4 text-black" ref={divRef}>
            <div className='detail-container'>
                <div className='detail-row'>
                    <img className='tripImage' src={sourceImg}></img>
                    <h6 className='detail-heading'>Source: </h6>
                    <h6 className='detail-heading source-info'>{source}</h6>
                </div>
            </div>

            <div className='detail-container'>
                <div className='detail-row'>
                    <img className='tripImage' src={destinationImg}></img>
                    <h6 className='detail-heading'>Destiation: </h6>
                    <h6 className='detail-heading destination-info'>{destination}</h6>
                </div>
            </div>

            <hr></hr>

            <div className='detail-container'>
                <div className='detail-row'>
                    <img className='tripImage' src={dtImg}></img>
                    <h6 className='detail-heading'>Date and time: </h6>
                    <h6 className='detail-heading date-info'>{tripDate}</h6>
                </div>
            </div>



            <div className='detail-container'>
                <div className='detail-row'>
                    <img className='tripImage' src={groupImg}></img>
                    <h6 className='detail-heading'>RideId: </h6>
                    <h6 className='detail-heading ride-info'>{rideID}</h6>
                </div>
            </div>

            <div className="detail-container">
                <div className="detail-row book-ride-row">
                    <button className='book-ride' onClick={bookRide}>Book Ride</button>
                </div>
            </div>
        </div>

    );
    return (
        <>
            {tripDetails.length === 0 ? <h1 style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30vh' }}>Currently! We Have Not Any Active Ride</h1> :
                tripDetails.map((data, index) => {
                    return (
                        <CardView key={index} {...data} rideID={data.rideId}/>
                    )
                })
            }
        </>
    )
}