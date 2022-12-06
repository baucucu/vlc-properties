import React from 'react';
import {
  Page,
  Navbar,
  List,
  ListInput,
  ListItem,
  Toggle,
  BlockTitle,
  Row,
  Button,
  Range,
  Block
} from 'framework7-react';

const BookingPage = () => (
  <Page name="form">
    <Navbar title="Booking" backLink="Back"></Navbar>
    <Row></Row>
    <BlockTitle>Booking</BlockTitle>
    <List noHairlinesMd>
      <ListInput
        label="Name"
        type="text"
        placeholder="Your name"
      ></ListInput>

      <ListInput
        label="E-mail"
        type="email"
        placeholder="E-mail"
      ></ListInput>

      <ListInput
        label="URL"
        type="url"
        placeholder="URL"
      ></ListInput>

      <ListInput
        label="Password"
        type="password"
        placeholder="Password"
      ></ListInput>

      <ListInput
        label="Phone"
        type="tel"
        placeholder="Phone"
      ></ListInput>

      <ListInput
        label="Gender"
        type="select"
        >
        <option>Male</option>
        <option>Female</option>
      </ListInput>

      <ListInput
        label="Birth date"
        type="date"
        placeholder="Birth day"
        defaultValue="2014-04-30"
      ></ListInput>

      <ListItem
        title="Toggle"
      >
        <Toggle slot="after" />
      </ListItem>

      <ListInput
        label="Range"
        input={false}
      >
        <Range slot="input" value={50} min={0} max={100} step={1} />
      </ListInput>

      <ListInput
        type="textarea"
        label="Textarea"
        placeholder="Bio"
      ></ListInput>
      <ListInput
        type="textarea"
        label="Resizable"
        placeholder="Bio"
        resizable
      ></ListInput>
    </List>
  </Page>
);

export default BookingPage;
