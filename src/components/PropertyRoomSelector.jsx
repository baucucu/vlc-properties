import React, { useEffect, useState } from 'react';
import { f7, List, ListInput } from 'framework7-react';
import _ from 'lodash';
import { getNumberFromString } from '../utils/utils';

export default function PropertyRoomSelector(props) {
    const { readOnly, properties, units, selectedProperty, setSelectedProperty, selectedUnit, setSelectedUnit } = props;
    const [rooms, setRooms] = useState();

    useEffect(() => {
        console.log({ selector: { properties, units } })
        if (!rooms && properties.length && units.length) {
            const tempRooms = _.groupBy(units.map(unit => ({ propertyId: unit.property.id, propertyName: properties.filter(property => property.docId === unit.property.id)[0].name, unitId: unit.docId, unitName: unit.name })), 'propertyName');
            setRooms(tempRooms)
        }
    }, [props])
    let picker

    useEffect(() => {
        console.log({ rooms })
        if (!rooms || picker) return;
        picker = f7.picker.create({
            inputEl: '#demo-picker-dependent',
            toolbar: true,
            toolbarCloseText: 'Done',
            openIn: 'auto',
            rotateEffect: true,
            inputReadOnly: readOnly,
            formatValue: function (values, displayValues) {
                console.log({ values, displayValues });
                return `${values[0]} ${values[1]}`
            },
            cols: [
                {
                    textAlign: 'left',
                    values: Object.keys(rooms).sort(),
                    onChange: function (picker, property) {
                        if (picker.cols[1].replaceValues) {
                            picker.cols[1].replaceValues(rooms[property].map(unit => unit.unitName).sort((a, b) => getNumberFromString(a) - getNumberFromString(b)));
                        }
                    }
                },
                {
                    values: rooms[Object.keys(rooms)[0]].map(unit => unit.unitName).sort((a, b) => getNumberFromString(a) - getNumberFromString(b)),
                    width: 160,
                },
            ],
            on: {
                opened: function () {
                    console.log('Picker opened')
                },
                closed: function () {
                    console.log('Picker closed')
                },
                change: function (picker, values, displayValues) {
                    console.log({ change: { picker, values, displayValues } })
                    console.log({ properties, units })
                    setSelectedProperty(properties.filter(property => property.name === values[0])[0].docId)
                    console.log({ selectedProperty })
                    setSelectedUnit(units.filter(unit => unit.name === values[1] && unit.property.id === properties.filter(property => property.name === values[0])[0].id)[0].docId)
                }
            }
        });
        if (selectedProperty && selectedUnit) {
            picker.setValue([properties.filter(property => property.docId === selectedProperty)[0].name, units.filter(unit => unit.docId === selectedUnit)[0].name])
        }
    }, [rooms])



    return (
        <List className="list no-hairlines-md" style={{ margin: 0 }} >
            <ListInput label="Room" input={false} autocomplete={false}>
                <input slot="input" type="text" placeholder="Select property and unit" id="demo-picker-dependent" />
            </ListInput>
        </List>
    )
}