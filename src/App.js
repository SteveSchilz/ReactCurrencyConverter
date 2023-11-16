import { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const [fromCurrency, setFromCurrency] = useState(1);
  const [toCurrency, setToCurrency] = useState(0);
  const [conversionString, setConversionString] = useState("");
  const [fromUnits, setFromUnits] = useState("USD");
  const [toUnits, setToUnits] = useState("EUR");
  const [isLoading, setIsLoading] = useState(false); // true while fetching
  const [error, setError] = useState(""); // Error string if any

  const CURRENCY_LIST = ["USD", "EUR", "CAD", "INR", "GBP"];

  useEffect(
    function fetchConversion() {
      // This API allows us to abort the request in a cleanup function
      // when a second request comes in while this one is running.
      // To do this, we pass controller.signal in the fetch request,
      // and use the cleanup function to abort the request: that happens
      // when a new request comes in BEFORE the current one has completed.
      const controller = new AbortController();

      async function fetchConversion() {
        if (fromUnits === toUnits) {
          console.log(
            "Converting from ",
            fromUnits,
            " to: ",
            toUnits,
            " Exiting..."
          );
          // This was blowing up when it changed the result to a string
          setToCurrency(Number(fromCurrency));
          return;
        }

        try {
          setIsLoading(true);
          setError("");
          console.log(
            "Converting: ",
            fromCurrency,
            " from",
            fromUnits,
            " to:",
            toUnits
          );
          /* Web API for Conversion: See: https://www.frankfurter.app/docs/#conversion */
          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${fromCurrency}&from=${fromUnits}&to=${toUnits}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something Went Wrong: Unable to convert!");
          }

          const data = await res.json();
          if (data.Response === "False")
            throw new Error("Currency Conversion Failed!");

          /* Result Object
             See: https://www.frankfurter.app/docs/#conversion
             data {
              amount :1    // fromCurrency
              base: "USD"  // fromUnits
              date: "2023-11-14"
              rates:         // Rates object: potentially an array?
                 EUR: 0.93   // FromUnits=Key, toCurrency Value
             }
          */
          var result = Number(data.rates[toUnits]);
          console.log(result);

          setToCurrency(result);
          setConversionString(
            ` Converted ${data.base} to ${toUnits} = ${result} on ${data.date}`
          );
          console.log(conversionString);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
            setToCurrency(0);
          }
        } finally {
          setIsLoading(false);
          console.log("...done fetching Conversion:", toCurrency);
        }
      }
      fetchConversion();

      return function () {
        console.log("Unmount");
      };
    },
    [fromCurrency, toCurrency, fromUnits, toUnits, conversionString]
  );

  function handleCurrencyChanged(value) {
    console.log("Currency Changed to:", value);
    setFromCurrency(value);
  }

  function handleFromChanged(value) {
    console.log("From Changed to: ", value);
    setFromUnits(value);
  }

  function handleToChanged(value) {
    console.log("  To Changed to: ", value);
    setToUnits(value);
  }

  return (
    <div>
      <h1>Simple Currency Converter</h1>
      <p>
        Uses{" "}
        <a
          href="https://www.frankfurter.app/docs/#conversion"
          alt="Frankfurter.app online currency converter"
        >
          Frankfurter.app online currency converter
        </a>{" "}
        to perform the conversion
      </p>
      <CurrencyValue
        value={fromCurrency}
        onChange={handleCurrencyChanged}
      ></CurrencyValue>
      <CurrencySelector
        currency={fromUnits}
        currencies={CURRENCY_LIST}
        onChange={handleFromChanged}
        styles="DropDowns"
      />
      <CurrencySelector
        currency={toUnits}
        currencies={CURRENCY_LIST}
        onChange={handleToChanged}
        styles="DropDowns"
      />

      <p>
        {error !== "" && (
          <p>
            Error: {error}, isLoading: {isLoading}
          </p>
        )}
        <DisplayResult value={toCurrency} infoString={conversionString} />
      </p>
    </div>
  );
}

function CurrencyValue({ value, onChange }) {
  // Allows any number of digits before the decimal
  // and up to 2 digits after the decimal
  const pattern = /^\d+(\.\d{0,2})?$/;

  function handleChange(value) {
    if (pattern.test(value)) {
      onChange(value);
    }
  }

  return (
    <input
      type="text"
      pattern={pattern}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="Inputs"
    />
  );
}

function DisplayResult({ value, infoString }) {
  return (
    <>
      <p className="Outputs">
        <em>Result:</em> {value.toFixed(2)}
      </p>
    </>
  );
}

function CurrencySelector({ currency, currencies, onChange, styles }) {
  return (
    <select
      className={styles}
      value={currency}
      onChange={(e) => onChange(e.target.value)}
    >
      {currencies.map((v, index) => (
        <option key={index} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}
