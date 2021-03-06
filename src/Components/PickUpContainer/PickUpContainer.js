import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'
import './PickUpContainer.css'
import PickUpEvent from '../PickUpEvent/PickUpEvent'
import EventFilterContainer from '../../js/containers/EventFilterContainer'
import PickUpEventDetailsContainer from '../../js/containers/PickUpEventDetailsContainer'
import EditPickUpEventContainer from '../../js/containers/EditPickUpEventContainer'
import { getEventsFetch } from '../../utility/fetch'
import screenshot from '../../screenshot.png'
import star from '../../markers/star.png'
import { css } from '@emotion/core'
import { CircleLoader } from 'react-spinners'

class PickUpContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filteredAttending: false,
      showEventDetail: false,
      showEventEdit: false,
      loading: true
    }
  }

  componentDidMount = () => {
    if (localStorage.getItem('pickUpLogin')) {
      getEventsFetch()
        .then(response => response.json())
        .then(events => {
          this.props.updateEvents(events)
          this.props.updateFilteredEvents(events)
        })
        .catch(error=>console.error(error))
    }
  }

  handleMapLoaded = () => {
    this.setState({loading: false})
  }

  getEvents = () => {
    getEventsFetch()
      .then(response => response.json())
      .then(events => this.props.updateEvents(events))
      .catch(error=>console.error(error))
  }

  updateUsers = (updatedEvent, user) => {
    const { events, filteredEvents } = this.props
    const unchangedEvents = this.filterUnchangedEvents(events, updatedEvent.id)
    const unchangedFilteredEvents = this.filterUnchangedEvents(filteredEvents, updatedEvent.id)

    this.setStateWithUpdatedEvent(unchangedEvents, unchangedFilteredEvents, updatedEvent)
  }

  removeUser = (eventId, userId) => {
    const { filteredAttending } = this.state
    const { events, filteredEvents } = this.props
    const eventToUpdate = events.find((event) => event.id === eventId)
    eventToUpdate.users = eventToUpdate.users.filter((user) => user.id !== userId)
    const unchangedEvents = this.filterUnchangedEvents(events, eventId)
    const unchangedFilteredEvents = this.filterUnchangedEvents(filteredEvents, eventId)
    if (filteredAttending) {
      this.setStateWithoutUpdatedEvent(unchangedEvents, unchangedFilteredEvents, eventToUpdate)
    } else {
      this.setStateWithUpdatedEvent(unchangedEvents, unchangedFilteredEvents, eventToUpdate)
    }
  }

  updateEvent = (updatedEvent) => {
    const { events, filteredEvents } = this.props
    const unchangedEvents = this.filterUnchangedEvents(events, updatedEvent.id)
    const unchangedFilteredEvents = this.filterUnchangedEvents(filteredEvents, updatedEvent.id)
    this.setStateWithUpdatedEvent(unchangedEvents, unchangedFilteredEvents, updatedEvent)
    this.toggleShowEventEdit()
  }

  filterUnchangedEvents = (events, updatedEventId) => {
    return events.filter((event) => event.id !== updatedEventId)
  }

  setStateWithUpdatedEvent = (unchangedEvents, unchangedFilteredEvents, updatedEvent) => {
    this.props.updateEvents([...unchangedEvents, updatedEvent])
    this.props.updateFilteredEvents([...unchangedFilteredEvents, updatedEvent])
    this.getEvents()
    this.toggleShowEventDetails({})
  }

  setStateWithoutUpdatedEvent = (unchangedEvents, unchangedFilteredEvents, updatedEvent) => {
    this.props.updateEvents([...unchangedEvents, updatedEvent])
    this.props.updateFilteredEvents(unchangedFilteredEvents)
    this.getEvents()
    this.toggleShowEventDetails({})
  }

  removeEvent = (eventId) => {
    const { events, filteredEvents } = this.props
    const updatedEvents = events.filter((event) => event.id !== eventId)
    const updatedFilteredEvents = filteredEvents.filter((event) => event.id !== eventId)

    this.props.updateEvents(updatedEvents)
    this.props.updateFilteredEvents(updatedFilteredEvents)
    this.toggleShowEventDetails()
    this.props.updateEventForDetail({})
    this.getEvents()
  }

  filterEvents = (filteredEvents) => {
    this.props.updateFilteredEvents(filteredEvents)
  }

  displayEventDetails = (event) => {
    this.props.updateEventForDetail(event)
    this.toggleShowEventDetails()
  }

  toggleShowEventDetails = () => {
    this.setState({
      showEventDetail: !this.state.showEventDetail
    })
  }

  toggleShowEventEdit = () => {
    this.setState({showEventEdit: !this.state.showEventEdit})
  }

  toggleFilteredAttending = () => {
    this.setState({filteredAttending: !this.state.filteredAttending})
  }

  render() {
    const { userLat, userLng, filteredEvents } = this.props
    const { showEventDetail, showEventEdit, loading } = this.state
    const API_KEY = process.env.REACT_APP_MAPS_API_KEY
    const override = css`
      display: block;
      margin: auto;
    `
    const eventItems = filteredEvents.map((event) => {
      return <PickUpEvent
        key={event.id + Date.now()}
        lat={event.latitude}
        lng={event.longitude}
        displayEventDetails={this.displayEventDetails}
        event={event}
      />
    })

    return(
      <React.Fragment >
        { loading && localStorage.getItem('pickUpLogin') ?
          <div className='sweet-loading'>
            <CircleLoader
              css={override}
              sizeUnit={"px"}
              size={150}
              color={'#123abc'}
              loading={loading}
            />
          </div> :
          null }
        {localStorage.getItem('pickUpLogin') ?
          <div>
            <EventFilterContainer
              filterEvents={this.filterEvents}
              toggleFilteredAttending={this.toggleFilteredAttending}
            />
            <div id="events-map">
              <GoogleMapReact
                bootstrapURLKeys={{ key: API_KEY }}
                defaultCenter={{
                lat: userLat,
                lng: userLng}}
                defaultZoom={12}
                onGoogleApiLoaded={this.handleMapLoaded}
                yesIWantToUseGoogleMapApiInternals
              >
              {eventItems}
              {showEventDetail ?
                <PickUpEventDetailsContainer
                  updateUsers={this.updateUsers}
                  removeUser={this.removeUser}
                  removeEvent={this.removeEvent}
                  toggleShowEventDetails={this.toggleShowEventDetails}
                  toggleShowEventEdit={this.toggleShowEventEdit}
                /> :
                null}
              {showEventEdit ?
                <EditPickUpEventContainer
                  userLat={userLat}
                  userLng={userLng}
                  toggleShowEventEdit={this.toggleShowEventEdit}
                  updateEvent={this.updateEvent}
                 /> :
                null}
              </GoogleMapReact>
          </div>
        <div className="star-explanation">
          <img id="star-for-explanation" alt="owned-event" src={star} /> <span className="star-explanation">Events you created</span>
        </div>
      </div> :
      <div>
        <p>This page gives you access to all pick up sports happening nearby, with the ability to filter as needed:</p>
        <img className="container-screenshot" src={screenshot} alt="screenshot" />
        <p>To gain access to this page, please either log in or create an account above.</p>
      </div>}
    </React.Fragment>
    )
  }
}

export default PickUpContainer
