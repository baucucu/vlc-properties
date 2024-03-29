import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, Row, Col, f7 } from 'framework7-react';
import '@fullcalendar/react/dist/vdom';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import currency from 'currency.js';
import useFirestoreListener from "react-firestore-listener"
import _ from 'lodash'
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isBetween);
dayjs.extend(minMax);
import { getNumberFromString, intersectDateRanges } from '../utils/utils';

function PropertiesPage({ f7router, f7route }) {
  const properties = useFirestoreListener({ collection: "properties" })
  const expenses = useFirestoreListener({ collection: "expenses" })
  const units = useFirestoreListener({ collection: "units" })
  const bookings = useFirestoreListener({ collection: "bookings" })
  const tenants = useFirestoreListener({ collection: "tenants" })
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [month, setMonth] = useState();

  const [finance, setFinance] = useState({
    monthlyExpenses: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    ytdExpenses: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    monthlyRevenue: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    ytdRevenue: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    monthlyProfit: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
    ytdProfit: currency(0, { symbol: '€', decimal: '.', separator: ',' }).format(),
  })


  function getMonthlyFinance() {
    // debugger;
    const monthlyExpenses = expenses
      .filter(item => dayjs(item?.date?.toDate()).isBetween(dayjs(month).startOf('month'), dayjs(month).endOf('month')))
      .filter(item => !['Cash in', 'Cash payment', 'Commissions'].includes(item.category))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const ytdExpenses = expenses
      .filter(item => dayjs(item?.date?.toDate()).isBetween(dayjs(month).startOf('year'), dayjs(month).endOf('month')))
      .filter(item => !['Cash in', 'Cash payment', 'Commissions'].includes(item.category))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    const monthlyRevenue = resources
      .reduce((partialSum, a) => partialSum + currency(a.unit_month_revenue).value, 0) || 0
    const ytdRevenue = resources
      .reduce((partialSum, a) => partialSum + currency(a.unit_year_revenue).value, 0) || 0
    const monthlyProfit = monthlyRevenue - monthlyExpenses
    const ytdProfit = ytdRevenue - ytdExpenses
    setFinance({
      monthlyExpenses: currency(monthlyExpenses, { symbol: '€', decimal: '.', separator: ',' }).format(),
      ytdExpenses: currency(ytdExpenses, { symbol: '€', decimal: '.', separator: ',' }).format(),
      monthlyRevenue: currency(monthlyRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      ytdRevenue: currency(ytdRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      monthlyProfit: currency(monthlyProfit, { symbol: '€', decimal: '.', separator: ',' }).format(),
      ytdProfit: currency(ytdProfit, { symbol: '€', decimal: '.', separator: ',' }).format(),
    })
  }


  function getUnitData(unit) {
    let propertyRevenue = 0
    let bookedDays = 0
    let unitMonthRevenue = 0
    let unitYearRevenue = 0
    let propertyBookings = bookings.filter(item => item.property.id === unit.property.id)

    propertyBookings.forEach(item => {
      let monthly = intersectDateRanges([
        { start: dayjs(item.checkIn.toDate()), end: dayjs(item.checkOut.toDate()) },
        { start: dayjs(month).startOf('month'), end: dayjs(month).endOf('month') }
      ])
      let yearly = intersectDateRanges([
        { start: dayjs(item.checkIn.toDate()), end: dayjs(item.checkOut.toDate()) },
        { start: dayjs(month).startOf('year'), end: dayjs(month).endOf('year') }
      ])
      if (monthly) {
        if (
          (dayjs(item.checkIn.toDate()).isSameOrAfter(dayjs(month).startOf('month'), "month") && dayjs(item.checkOut.toDate()).isSameOrBefore(dayjs(month).endOf('month'), "month"))
          || (dayjs(item.checkIn.toDate()).isSameOrBefore(dayjs(month).startOf('month'), "month") && dayjs(item.checkOut.toDate()).isSameOrAfter(dayjs(month).endOf('month'), "month"))
          || (dayjs(item.checkIn.toDate()).isSameOrBefore(dayjs(month).startOf('month'), "month") && dayjs(item.checkOut.toDate()).isSameOrAfter(dayjs(month).startOf('month').add(10, "days"), "month"))
        ) {
          propertyRevenue += item.rent
        }
        if (item.unit.id === unit.docId) {
          bookedDays += monthly.end.diff(monthly.start, "days") + 1 || 0
          unitMonthRevenue += item.rent
        }
      }
      if (yearly && item.unit.id === unit.docId) {
        let months = yearly.end.diff(yearly.start, "months")
        // if (months > 0) months++
        unitYearRevenue = item.rent * months
      }
    })
    let propertyExpenses = expenses
      .filter(item => item.property.id === unit.property.id)
      .filter(item => item.category !== "Cash in")
      .filter(item => dayjs(item?.date?.toDate()).isBetween(dayjs(month).startOf('month'), dayjs(month).endOf('month')))
      .reduce((partialSum, a) => partialSum + a.amount, 0) || 0
    let res = {
      property_revenue: currency(propertyRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      property_expenses: currency(propertyExpenses, { symbol: '€', decimal: '.', separator: ',' }).format(),
      property_profit: currency(propertyRevenue, { symbol: '€', decimal: '.', separator: ',' }).subtract(propertyExpenses).format(),
      unit_month_revenue: currency(unitMonthRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      unit_year_revenue: currency(unitYearRevenue, { symbol: '€', decimal: '.', separator: ',' }).format(),
      booked_days: `${bookedDays} days`
    }
    return res

  }

  let calendarRef = React.createRef()

  function handleMonthChange(direction) {

    let calendarApi = calendarRef.current.getApi()
    let currentView = calendarApi.view
    direction === 'prev' && calendarApi.prev()
    direction === 'next' && calendarApi.next()
    setMonth(currentView.currentStart)
  }
  useEffect(() => {
    setMonth(dayjs().startOf('month'))
    // console.log('f7route.query?.tenantId', f7route.query?.tenantId)
    // f7.store.dispatch('setTenantId', { tenantId: f7route.query?.tenantId })
  }, [])


  useEffect(() => {
    if (month && expenses && resources) {
      getMonthlyFinance()
    }
  }, [month, expenses, resources])


  useEffect(() => {
    units.length > 0 && setResources(
      units
        .map(unit => {
          let { property_revenue, property_expenses, property_profit, unit_month_revenue, unit_year_revenue, booked_days } = getUnitData(unit)
          return ({
            id: unit.docId,
            unit: unit.name,
            priority: getNumberFromString(unit.name),
            property: properties.filter(property => property.docId === unit.property.id)[0].name,
            property_revenue,
            property_expenses,
            property_profit,
            unit_month_revenue,
            unit_year_revenue,
            booked_days
          })
        }).sort((a, b) => a.priority - b.priority))
  }, [month, bookings])

  useEffect(() => {
    setEvents(bookings.map(booking => {
      return ({
        id: booking.docId,
        title: tenants.filter(tenant => tenant.docId === booking.tenant.id)[0]?.name,
        start: dayjs(booking.checkIn.toDate()).format('YYYY-MM-DD'),
        end: dayjs(booking.checkOut.toDate()).format('YYYY-MM-DD'),
        allDay: true,
        resourceId: booking.unit.id,
        // color: booking.Type === 'Monthly' ? 'teal' : 'purple'
      })
    }))
  }, [bookings])


  return (
    <Page>
      <Navbar title="Properties">
      </Navbar>
      <Row>
        <Col>
          <Scorecard type="revenue" month={month} finance={finance} />
        </Col>
        <Col>
          <Scorecard type="profit" month={month} finance={finance} />
        </Col>
        <Col>
          <Scorecard type="expenses" month={month} finance={finance} />
        </Col>
      </Row>
      <Block>
        {events && <FullCalendar
          ref={calendarRef}
          height="55vh"
          plugins={[resourceTimelinePlugin]}
          schedulerLicenseKey='CC-Attribution-NonCommercial-NoDerivatives'
          initialView='resourceTimelineMonth'
          resourceOrder='priority'
          nowIndicator
          eventClick={function (info) {
            let recordId = info.event._def.publicId
            // console.log({ recordId })
            f7router.navigate(`/bookings/${recordId}`)
          }}
          resourceAreaColumns={[
            {
              group: true,
              field: 'property',
              headerContent: 'Property',
              width: 150,
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
              field: 'unit_month_revenue',
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
              click: function () {
                handleMonthChange('prev')
              }
            },
            nextMonth: {
              text: '>',
              click: function () {
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
  const { type, month, finance } = props
  let monthly, ytd
  let title, backgroundColor
  const bookings = useFirestoreListener({ collection: "bookings" })

  const [monthlyRevenue, setMonthlyRevenue] = useState(currency(0, { symbol: '€', decimal: '.', separator: ',' }))
  const [yearlyRevenue, setYearlyRevenue] = useState(currency(0, { symbol: '€', decimal: '.', separator: ',' }))

  useEffect(() => {
    if (month && bookings) {
      setMonthlyRevenue(getMonthlyRevenue(month))
      setYearlyRevenue(getYearlyRevenue())
    }
  }, [month, bookings])

  const getMonthlyRevenue = (selectedMonth) => {
    console.log({ selectedMonth })
    const monthStartDate = dayjs(selectedMonth).startOf('month');
    const monthEndDate = dayjs(selectedMonth).endOf('month');

    let revenueForMonth = currency(0);

    bookings.forEach((booking) => {
      const bookingCheckInDate = dayjs(booking.checkIn.toDate());
      const bookingCheckOutDate = dayjs(booking.checkOut.toDate());
      const rent = currency(booking.rent);

      if (
        bookingCheckInDate.isBefore(monthEndDate) &&
        bookingCheckOutDate.isAfter(monthStartDate) &&
        (!bookingCheckOutDate.isBefore(monthStartDate.add(10, 'day')))
      ) {
        revenueForMonth = revenueForMonth.add(rent.value);
      }
    });

    return revenueForMonth;
  };

  const getYearlyRevenue = () => {
    let revenueForYear = currency(0);
    const year = dayjs(month).year();
    const months = Array.from({ length: 12 }, (_, index) => dayjs().year(year).month(index).startOf('month'));
    months.forEach((item) => {
      const revenue = getMonthlyRevenue(item);
      revenueForYear = revenueForYear.add(revenue)
      console.log({ revenue, revenueForYear })
    })

    return revenueForYear;
  }

  switch (type) {
    case "revenue":
      title = "Revenue"
      backgroundColor = "deeppurple"
      monthly = currency(monthlyRevenue?.value, { symbol: '€', decimal: '.', separator: ',' }).format()
      ytd = currency(yearlyRevenue?.value, { symbol: '€', decimal: '.', separator: ',' }).format()
      break;
    case "expenses":
      title = "Expenses"
      backgroundColor = "deeporange"
      monthly = finance.monthlyExpenses
      ytd = finance.ytdExpenses
      break;
    case "profit":
      title = "Profit"
      backgroundColor = "teal"
      monthly = currency(monthlyRevenue?.subtract(finance.monthlyExpenses),{symbol: '€', decimal: '.', separator: ',' }).format()
      ytd = currency(yearlyRevenue?.subtract(finance.ytdExpenses),{symbol: '€', decimal: '.', separator: ',' }).format()
      break;
    default:
      break;
  }
  if (!month) return null
  return (
    <Block textColor='white' inset strong className={`bg-color-${backgroundColor} elevation-10`}>
      <h2 style={{ opacity: 0.8 }}>{title}</h2>
      <h3 style={{ opacity: 0.8 }}>{dayjs(month).format("MMMM")}: {monthly}</h3>
      <h3 style={{ opacity: 0.8 }}>{dayjs(month).format("YYYY")}: {ytd}</h3>
    </Block>
  )
}

