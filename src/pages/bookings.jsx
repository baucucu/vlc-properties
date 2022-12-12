import React from 'react';
import { Page, Navbar, Block, List, ListItem, useStore,Chip, Badge, Button } from 'framework7-react';
import dayjs from 'dayjs';

const BookingsPage = () => {
  const bookings = useStore('bookings')
  const tenants = useStore('tenants')
  const properties = useStore('properties')
  const units = useStore('units')
  
  function handleNewBooking(){}

  return (
    <Page>
      <Navbar title="Bookings">
        <Button onClick={handleNewBooking}>Add new booking</Button>
      </Navbar>
      <Block>
        <List mediaList>
          {
            bookings.map(booking => {
              let tenant = tenants.filter(tenant => tenant.id === booking.Tenant[0])[0]
              let property = properties.filter(property => property.id === booking.Property[0])[0]
              let unit = units.filter(unit => unit.id === booking.Unit[0])[0]
              return (
                <ListItem
                  key={booking.id}
                  link={`/bookings/${booking.id}`}
                  title={
                    <div style={{display:"flex", gap:16}}>
                      
                      <Chip 
                        text={tenant.Name} 
                        media="Te"
                        mediaBgColor="deeppurple"
                      >  
                      </Chip>
                      <Chip 
                        text={`${property.Name} - ${unit.Name}`} 
                        media="Pr"
                        mediaBgColor="deeporange"
                      >  
                      </Chip>
                      <Chip 
                        text={`${dayjs(booking["Check in"]).format("D MMM YY")} to ${dayjs(booking["Check out"]).format("D MMM YY")}`} 
                        color="teal"
                        // mediaBgColor="orange"
                      >  
                      </Chip>
                      
                    </div>
                  }
                  text={
                    <div style={{display:"flex", gap:4, marginTop: 16}}>
                      <Badge
                        color='black'
                      >
                        {booking.Channel}
                      </Badge>
                      <Badge
                        color='red'
                      >
                        {booking.Type}
                      </Badge>
                    </div>
                  }
                  after={
                    <div style={{display:"flex", flexDirection:"row-reverse",gap:16}}>
                      <Chip
                        text={booking.Status}
                        color={booking.Status === "Confirmed" ? "teal" : "blue"}
                      >
                      </Chip>
                      <Chip
                        text={booking["Contract status"] || "N/A"}
                        color={booking["Contract status"] === "Signed" ? "teal" : "red"}
                        media="Co"
                        mediaBgColor='gray'
                      >
                      </Chip>
                      
                    </div>
                  }
                  
                >
                </ListItem>
              )
            })
          }
        </List>
      </Block>
    </Page>
  );
}

export default BookingsPage;
