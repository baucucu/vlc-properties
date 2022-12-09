import React, { useEffect,useState } from 'react';
import { Page, BlockTitle, Navbar, Block, Link, Chip, List, ListItem, useStore, CardHeader,CardContent, Segmented,Tabs, Tab, Button, Row, Col, Card } from 'framework7-react';
import '@fullcalendar/react/dist/vdom';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(isBetween);
dayjs.extend(minMax);
import currency from 'currency.js';

const PropertiesPage = () => {
  const properties = useStore('properties');
  const units = useStore('units');
  const bookings = useStore('bookings');
  const revenue = useStore('revenue');
  const expenses = useStore('expenses');
  const tenants = useStore('tenants')

  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState()
  const [finance, setFinance] = useState({
      monthlyExpenses: `€${currency(0)}`,
      ytdExpenses: `€${currency(0)}`,
      monthlyRevenue: `${currency(0)}`,
      ytdRevenue: `€${currency(0)}`,
      monthlyProfit: `€${currency(0)}`,
      ytdProfit: `€${currency(0)}`,
  })

  function getMonthlyFinance(){
    // debugger;
    const monthlyExpenses = expenses
      .filter(item => dayjs(item.Date).isBetween(dayjs(month).startOf('month'),dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.Amount, 0) || 0
    const ytdExpenses = expenses
      .filter(item => dayjs(item.Date).isBetween(dayjs(month).startOf('year'),dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.Amount, 0) || 0
    const monthlyRevenue = revenue
      .filter(item => dayjs(item.Date).isBetween(dayjs(month).startOf('month'),dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.Amount, 0) || 0
    const ytdRevenue = revenue
      .filter(item => dayjs(item.Date).isBetween(dayjs(month).startOf('year'),dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.Amount, 0) || 0
    const monthlyProfit = monthlyRevenue - monthlyExpenses
    const ytdProfit = ytdRevenue - ytdExpenses
    setFinance({
      monthlyExpenses: currency(monthlyExpenses, { symbol: '€', decimal: ',', separator: '.' }).format(),
      ytdExpenses: currency(ytdExpenses, { symbol: '€', decimal: ',', separator: '.' }).format(),
      monthlyRevenue: currency(monthlyRevenue, { symbol: '€', decimal: ',', separator: '.' }).format(),
      ytdRevenue: currency(ytdRevenue, { symbol: '€', decimal: ',', separator: '.' }).format(),
      monthlyProfit: currency(monthlyProfit, { symbol: '€', decimal: ',', separator: '.' }).format(),
      ytdProfit: currency(ytdProfit, { symbol: '€', decimal: ',', separator: '.' }).format(),
    })
  }

  function getUnitData(unitId,propertyId){
    let propertyRevenue = revenue
      .filter(item => item.Property[0]===propertyId && `${dayjs(month,'MM-YYYY').month()}${dayjs(month,'MM-YYYY').year()}` === `${dayjs(item.Date,'MM-YYYY').month()}${dayjs(item.Date,'MM-YYYY').year()}`)
      .map(item => ({unit: item.Unit[0], amount: item.Amount}))
    let propertyRevenueAmount = propertyRevenue.reduce((partialSum, a) => partialSum + a.amount, 0)
    
    let unitRevenue = propertyRevenue.filter(item => item.unit === unitId)
    let unitRevenueAmount = unitRevenue.reduce((partialSum, a) => partialSum + a.amount, 0)
    
    let propertyExpenses = expenses
      .filter(item => item.Property[0] === propertyId)
      .filter(item => `${dayjs(month,'MM-YYYY').month()}${dayjs(month,'MM-YYYY').year()}` === `${dayjs(item.Date,'MM-YYYY').month()}${dayjs(item.Date,'MM-YYYY').year()}`)
      .reduce((partialSum, a) => partialSum + a.Amount, 0)
    
    let currentBookings = bookings
      .filter(booking => booking.Unit[0] === unitId)
      .filter(booking => 
        dayjs(month).isBefore(dayjs(booking["Check in"])) && dayjs(month).endOf('month').isAfter(booking["Check in"]) ||
        dayjs(month).isBefore(dayjs(booking["Check out"])) && dayjs(month).endOf('month').isAfter(booking["Check out"]) ||
        dayjs(month).isBetween(booking["Check in"],booking["Check out"]) && dayjs(month).endOf('month').isBetween(booking["Check in"],booking["Check out"])
      )
    let booked_days = currentBookings
      .map(booking => {
        let start = dayjs.min(booking["Check out"],dayjs(month).endOf('month'))
        let end = dayjs.max(booking["Check in"],dayjs(month))
        let res = dayjs(start).startOf('day').diff(dayjs(end).endOf('day'),'day')+1
        return res
      })
      .reduce((partialSum, a) => partialSum + a, 0)
    return {
      property_revenue: currency(propertyRevenueAmount,{ symbol: '€', decimal: ',', separator: '.' }).format(),
      property_expenses: currency(propertyExpenses,{ symbol: '€', decimal: ',', separator: '.' }).format(),
      property_profit: currency(propertyRevenueAmount,{ symbol: '€', decimal: ',', separator: '.' }).subtract(propertyExpenses).format(),
      unit_revenue: currency(unitRevenueAmount,{ symbol: '€', decimal: ',', separator: '.' }).format(),
      booked_days: `${booked_days} days`,
      occupancy: `${Number(booked_days*100/dayjs(month).daysInMonth()).toFixed(0)}%`
    }
  }

  let calendarRef = React.createRef()
  
  function handleMonthChange(direction){
    
    let calendarApi = calendarRef.current.getApi()
    let currentView = calendarApi.view
    direction === 'prev'  && calendarApi.prev()
    direction === 'next' && calendarApi.next()

    setMonth(currentView.currentStart)
  }
  useEffect(() => {
    setMonth(dayjs().startOf('month'))
  },[])
  useEffect(()=> {getMonthlyFinance()},[month,expenses,revenue])


  useEffect(() => {
    setResources(units.map(unit => {
      let {property_revenue,property_expenses,property_profit,unit_revenue,booked_days} = getUnitData(unit.id, unit.Property[0])
      return({
        id: unit.id,
        unit: unit.Name,
        property: properties.filter(property => property.id ===unit.Property[0])[0].Name,
        property_revenue,
        property_expenses,
        property_profit,
        unit_revenue,
        booked_days,
        // occupancy
      })
    }))
  },[month, bookings])

  useEffect(() => {
    // console.log({properties})
    // console.log({units})
    // console.log(bookings)
    // console.log({revenue})
    // console.log({expenses})
    // console.log({tenants})
    setEvents(bookings.map(booking => {
      return({
        id: booking.id,
        title: booking.Booking,
        start: booking["Check in"],
        end: booking["Check out"],
        allDay: true,
        resourceId: booking.Unit[0],
        color: booking.Type === 'Monthly' ? 'teal' : 'purple'
      })
    }))
  },[bookings])

  
  return (
    <Page>
      <Navbar title="Properties">
      </Navbar>
      <Row>
        <Col>
          <Scorecard type="revenue" month={month} finance={finance}/>
        </Col>
        <Col>
          <Scorecard type="profit" month={month} finance={finance}/>
        </Col>         
        <Col>
          <Scorecard type="expenses" month={month} finance={finance}/>
        </Col>
      </Row>
      <Block>
      {events&&<FullCalendar 
        ref={calendarRef}
        height="55vh"
        plugins={[resourceTimelinePlugin]}
        schedulerLicenseKey='CC-Attribution-NonCommercial-NoDerivatives'
        initialView='resourceTimelineMonth'
        resourceOrder='unit,property'
        resourceAreaColumns= {[
          {
            group: true,
            field: 'property',
            headerContent: 'Property',
            width:150
          },
          {
            group: true,
            field: 'property_revenue',
            headerContent: 'Revenue'
          },
          {
            group: true,
            field: 'property_expenses',
            headerContent: 'Expenses'
          },
          {
            group: true,
            field: 'property_profit',
            headerContent: 'Profit'
          },
          {
            field: 'unit',
            headerContent: 'Room'
          },
          {
            // group: true,
            field: 'unit_revenue',
            headerContent: 'Revenue'
          },
          {
            field: 'booked_days',
            headerContent: 'Booked'
          }
        ]}
        resourceAreaWidth='50%'
        resources={resources}
        events={events}
        customButtons={{
          prevMonth: {
            text: '<',
            click: function() {
              handleMonthChange('prev')
            }
          },
          nextMonth: {
            text: '>',
            click: function() {
              handleMonthChange('next')
            }
          }
        }}
        headerToolbar={{
          left: 'today prevMonth nextMonth',
          center: 'title',
          right: ''
        }}
      />}
      </Block>
    </Page> 
  );
}

export default PropertiesPage;

const Scorecard = (props) => {
  const {type, month, finance} = props
  let monthly, ytd
  let title, backgroundColor
  switch(type) {
    case "revenue":
      title = "Revenue"
      backgroundColor="deeppurple"
      monthly=finance.monthlyRevenue
      ytd=finance.ytdRevenue
      break;
    case "expenses":
      title = "Expenses"
      backgroundColor="deeporange"
      monthly=finance.monthlyExpenses
      ytd=finance.ytdExpenses
      break;
    case "profit":
        title = "Profit"
        backgroundColor="teal"
        monthly=finance.monthlyProfit
        ytd=finance.ytdProfit
        break;
    default:
      break;
  }
  return(
    <Block textColor='white' inset strong className={`bg-color-${backgroundColor} elevation-10`}>
        <h2 style={{ opacity: 0.8 }}>{title}</h2>
        <h3 style={{ opacity: 0.8 }}>{dayjs(month).format("MMMM")}: {monthly}</h3>
        <h3 style={{ opacity: 0.8 }}>YTD {dayjs(month).format("YYYY")}: {ytd}</h3>
    </Block>
  )
}

