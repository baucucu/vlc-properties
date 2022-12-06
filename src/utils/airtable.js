import Airtable from 'airtable';

const base = new Airtable({apiKey: import.meta.env.VITE_AIRTABLE_KEY}).base('app7IkFVMW99zzGgj');

export default base
