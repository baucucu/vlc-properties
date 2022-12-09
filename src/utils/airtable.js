import Airtable from 'airtable';
import axios from 'axios';

// const base = new Airtable({apiKey: import.meta.env.VITE_AIRTABLE_KEY}).base('app7IkFVMW99zzGgj');
const getRecords = async (table)  => {
    let records = [];
    let offset
    do {
        let data = await axios(`https://api.airtable.com/v0/app7IkFVMW99zzGgj/${table}?view=Grid%20view${offset ? `&offset=${offset}` : ''}`,{
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_AIRTABLE_KEY}`
            }
        }).then( res => ({records: res.data.records, offset: res.data.offset}))
        records = [...records,...data.records.map(record => ({id:record.id, ...record.fields}))]
        offset = data.offset
    } while(offset)
    return records
}

const updateRecords = async (table,update) => {
    return await axios(`https://api.airtable.com/v0/app7IkFVMW99zzGgj/${table}`,{
        headers:{"Authorization": `Bearer ${import.meta.env.VITE_AIRTABLE_KEY}`},
        method: "PATCH",
        data : update
    })
}
export {getRecords, updateRecords}
// export default base
