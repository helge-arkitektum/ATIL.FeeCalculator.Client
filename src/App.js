import { useEffect, useState } from 'react';
import { getAsync } from 'utils/api';
import Select from 'react-select'
import parseDecimalNumber from 'parse-decimal-number';
import './App.scss';

const API_BASE_URI = process.env.REACT_APP_API_BASE_URI;
const API_BYGNINGSTYPER_METHOD = process.env.REACT_APP_API_BYGNINGSTYPER_METHOD;
const API_TILTAKSTYPER_METHOD = process.env.REACT_APP_API_TILTAKSTYPER_METHOD;
const API_GEBYR_METHOD = process.env.REACT_APP_API_GEBYR_METHOD;

function App() {
   const [bygningstyper, setBygningstyper] = useState([]);
   const [selectedBygningstype, setSelectedBygningstype] = useState(null);
   const [tiltakstyper, setTiltakstyper] = useState([]);
   const [selectedTiltakstype, setSelectedTiltakstype] = useState(null);
   const [areal, setAreal] = useState('');
   const [parsedAreal, setParsedAreal] = useState(null);
   const [beløp, setBeløp] = useState(null);
   const [kategori, setKategori] = useState(null);

   useEffect(
      () => {
         async function fetchBygningstyper() {
            const response = await getAsync(`${API_BASE_URI}/${API_BYGNINGSTYPER_METHOD}`);

            if (response !== null) {
               setBygningstyper(response);
            }
         }

         async function fetchTiltakstyper() {
            const response = await getAsync(`${API_BASE_URI}/${API_TILTAKSTYPER_METHOD}`);

            if (response !== null) {
               setTiltakstyper(response);
            }
         }

         fetchBygningstyper();
         fetchTiltakstyper();
      },
      []
   );

   async function calculate() {
      const params = {
         tiltakstype: selectedTiltakstype.kode,
         bygningstype: selectedBygningstype.kode,
         areal: parsedAreal.toString()
      };

      const response = await getAsync(`${API_BASE_URI}/${API_GEBYR_METHOD}`, { params });
      const gebyr = response?.gebyr;

      if (gebyr) {
         setBeløp(`${gebyr.gebyrbeloep} NOK`);
         setKategori(gebyr.gebyrkategori);
      }
   }

   function canCalculate() {
      return selectedTiltakstype !== null && selectedBygningstype !== null && parsedAreal !== null;
   }

   function handleBygningstyperChanged(option) {
      setSelectedBygningstype(option);
   }

   function handleTiltakstyperChanged(option) {
      setSelectedTiltakstype(option);
   }

   function handleInputChange(event) {
      const value = event.target.value;
      const parsed = parseDecimalNumber(value, [' ', ',']);

      if (!isNaN(parsed)) {
         setAreal(value);
         setParsedAreal(parsed);
      }
   }

   if (!bygningstyper.length || !tiltakstyper.length) {
      return null;
   }

   return (
      <div className="app">
         <div className="header">
            <div className="title">
               <span>Arbeidstilsynet</span>
               <span>Gebyrkalkulator</span>
            </div>
         </div>
         <div className="form">

            <div className="form-element">
               <div className="label">Tiltakstype</div>
               <Select
                  options={tiltakstyper}
                  value={selectedTiltakstype}
                  getOptionValue={option => `${option['kode']}`}
                  getOptionLabel={option => `${option['navn']}`}
                  noOptionsMessage={() => 'Ingen tiltakstyper funnet'}
                  onChange={handleTiltakstyperChanged}
                  isClearable
                  isSearchable
                  placeholder="-- Velg fra listen eller begynn å skrive"
                  classNamePrefix="react-select"
               />
            </div>

            <div className="form-element">
               <div className="label">Tiltakstype</div>
               <Select
                  options={bygningstyper}
                  value={selectedBygningstype}
                  getOptionValue={option => `${option['kode']}`}
                  getOptionLabel={option => `${option['kode']} - ${option['navn']}`}
                  noOptionsMessage={() => 'Ingen bygningstyper funnet'}
                  onChange={handleBygningstyperChanged}
                  isClearable
                  isSearchable
                  placeholder="-- Velg fra listen eller begynn å skrive"
                  classNamePrefix="react-select"
               />
            </div>

            <div className="form-element">
               <div className="label">Brutto areal (m²)</div>
               <input type="text" value={areal} onChange={handleInputChange} placeholder="-- Skriv her" />
            </div>

            <div className="calculate">
               <button onClick={calculate} disabled={!canCalculate()}>Beregn gebyr</button>
            </div>

            <div className="result">
               <div>
                  <span>Gebyrbeløp:</span>
                  <span>{beløp || '--'}</span>
               </div>
               <div>
                  <span>Gebyrkategori:</span>
                  <span>{kategori || '--'}</span>
               </div>
            </div>
         </div>
      </div>
   );
}

export default App;
