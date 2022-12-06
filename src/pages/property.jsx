import React from 'react';
import { Page, Navbar, Block, List, ListItem } from 'framework7-react';

const PropertyPage = (props) => {
  const { property } = props;

  return (
    <Page>
      <Navbar title={`${property.name} - ${property.propertyId} `}/>
      <Block strong>
        {/* {user.about} */}
      </Block>
      {/* <List>
        {user.links.map((link, index) => (
          <ListItem
            key={index}
            link={link.url}
            title={link.title}
            external
            target="_blank"
          ></ListItem>
        ))}
      </List> */}
    </Page>
  );
}

export default PropertyPage;
